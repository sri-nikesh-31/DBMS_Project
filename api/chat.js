import Groq from "groq-sdk";
import { createClient } from "@supabase/supabase-js";

// Initialize Groq (Requires GROQ_API_KEY in Vercel ENV)
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

// Initialize Supabase Backend Client
const supaUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supaKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_KEY;
const supabase = supaUrl && supaKey ? createClient(supaUrl, supaKey) : null;

export default async function handler(req, res) {
  // CORS setup if accessed outside Vercel's proxy
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  if (!groq) {
    return res.status(500).json({ error: "Server Configuration Error: Missing GROQ_API_KEY." });
  }

  try {
    let body;
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch(e) {
      body = req.body;
    }

    const { message, chatHistory = [] } = body || {};
    
    // Fallback if no message
    if (!message) {
      return res.status(400).json({ error: "No message provided." });
    }

    // 1. Controlled Context Prompt with Navigation
    const systemPrompt = `
You are a concise, helpful, and friendly AI chatbot for the "Aura" e-commerce platform.

Aura Overview & Features:
- Multi-vendor marketplace (individuals can sell products).
- Integrated QR-based payments system.
- Robust Order Tracking & Inventory system.
- Customer support ticket handling.

Navigation Guide (Available Pages):
- / : Home Page
- /products : Product Listing
- /cart : Shopping Cart
- /checkout & /payment : Checkout flow
- /profile : User Profile (requires login)
- /orders : Order History (requires login)
- /wishlist : Saved Items (requires login)
- /support : Customer Support
- /become-vendor : Apply to become a seller
- /vendor-dashboard : Vendor management interface
- /login & /signup : Authentication

Guidelines for responding:
1. Keep general answers brief (max 2-3 short sentences). EXCEPTION: If you are listing products or vendors fetched from a tool, ignore this length limit and display the full list.
2. If the user asks about available products, what is in stock, or what vendors are on the platform, YOU MUST ALWAYS CALL THE RELEVANT TOOL to fetch the data. Once fetched, YOU MUST EXPLICITLY PRINT THE ENTIRE LIST of products or vendors in your chat response. Do not just say "Here is the list" without actually displaying it.
3. Be conversational and polite. If a user simply says "hi", "hello", or greets you, respond warmly and ask how you can help them.
4. If a user asks how to do something (like viewing orders or checking out), guide them using the Navigation Guide.
5. CRITICAL: You are a strictly READ-ONLY assistant. You absolutely CANNOT add items to the user's cart, process payments, or perform any actions on their behalf. If a user asks you to do this, instruct them to visit the appropriate page.`;

    // 2. Define Tools for Groq
    const tools = [
      {
        type: "function",
        function: {
          name: "get_all_products",
          description: "Get the list of all available products on the platform, including their price and stock.",
          parameters: {
            type: "object",
            properties: {},
            required: []
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_vendor_details",
          description: "Get the list of vendor names active on the platform.",
          parameters: {
            type: "object",
            properties: {},
            required: []
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_categories",
          description: "Get the list of all product categories available on the platform.",
          parameters: {
            type: "object",
            properties: {},
            required: []
          }
        }
      }
    ];

    // 3. Format Messages for Groq
    let formatMessages = [
      { role: "system", content: systemPrompt },
      ...chatHistory.slice(-5), // Only keep last 5 interactions to save token payload size
      { role: "user", content: message }
    ];

    // 4. First Groq API Call (Check for Tool Calls)
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b", // Using custom model as requested
      messages: formatMessages,
      tools: tools,
      tool_choice: "auto",
      temperature: 0.6,
      max_tokens: 1500
    });

    const responseMessage = completion.choices[0].message;
    const toolCalls = responseMessage.tool_calls;

    // 5. Handle Tool Calls
    if (toolCalls && toolCalls.length > 0) {
      formatMessages.push(responseMessage); // append the assistant's tool call message
      
      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name;
        let functionResponse = "";

        if (functionName === 'get_all_products' && supabase) {
          const { data, error } = await supabase
            .from('products')
            .select('name, price, inventory(stock_quantity)')
            .limit(50); // limit to 50 to prevent huge payloads
            
          if (!error && data) {
            const formatted = data.map(p => `- ${p.name}: ₹${p.price} (${p.inventory?.[0]?.stock_quantity || 0} in stock)`).join("\n");
            functionResponse = `Products:\n${formatted}`;
          } else {
            functionResponse = "Failed to fetch products from the database.";
          }
        } 
        else if (functionName === 'get_vendor_details' && supabase) {
          const { data, error } = await supabase
            .from('vendors')
            .select('name')
            .eq('status', 'approved')
            .limit(50);
            
          if (!error && data) {
            const formatted = data.map(v => `- ${v.name}`).join("\n");
            functionResponse = `Approved Vendors:\n${formatted}`;
          } else {
            functionResponse = "Failed to fetch vendors from the database.";
          }
        } 
        else if (functionName === 'get_categories' && supabase) {
          const { data, error } = await supabase
            .from('categories')
            .select('category_name');
            
          if (!error && data) {
            const formatted = data.map(c => `- ${c.category_name}`).join("\n");
            functionResponse = `Available Categories:\n${formatted}`;
          } else {
            functionResponse = "Failed to fetch categories from the database.";
          }
        } 
        else {
          functionResponse = "Tool not found or database not connected.";
        }

        // Append tool result
        formatMessages.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: functionResponse,
        });
      }

      // 6. Second Groq API Call with Tool Results
      // Pass tools again but force tool_choice to "none" so the model ONLY summarizes
      const secondCompletion = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: formatMessages,
        tools: tools,
        tool_choice: "none",
        temperature: 0.6,
        max_tokens: 1500
      });

      const finalReply = secondCompletion.choices[0].message.content?.trim();
      if (!finalReply) throw new Error("Empty response object from Groq LLM after tool call.");

      return res.status(200).json({ reply: finalReply });
    }

    // 7. Safely Extract & Return if no tools were called
    const replyText = responseMessage.content?.trim();
    if (!replyText) {
       throw new Error("Empty response object from Groq LLM.");
    }

    return res.status(200).json({
      reply: replyText,
    });

  } catch (err) {
    console.error("Chat API Error:", err);
    // Generic fallback for user
    return res.status(500).json({ 
      reply: "Sorry, I couldn't process that. Please try again." 
    });
  }
}
