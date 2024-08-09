import { serve } from "https://deno.land/std@0.114.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";

// Configura el cliente de Supabase con la Service Role Key
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""  // Esta clave tiene permisos elevados
);

serve(async (req) => {
  const allowedOrigins = ["https://softwarebiobio.com"];
  const origin = req.headers.get("origin");

  // Manejar la solicitud OPTIONS (Preflight request)
  if (req.method === "OPTIONS") {
    if (!origin || !allowedOrigins.includes(origin)) {
      return new Response("Forbidden", { status: 403 });
    }

    // Devuelve una respuesta 200 con los encabezados CORS permitidos
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // Verifica el método de la solicitud
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // Verifica el origen de la solicitud
  if (!allowedOrigins.includes(origin)) {
    return new Response("Forbidden: Invalid Origin", { status: 403 });
  }

  // Obtén los datos del formulario
  const { name, email, phone, message } = await req.json();

  if (!name || !email || !phone || !message) {
    return new Response("Missing fields", { status: 400 });
  }

  // Inserta los datos en Supabase usando la Service Role Key
  const { error } = await supabase.from("contact_messages").insert([
    { name, email, phone, message }
  ]);

  if (error) {
    return new Response("Error saving message", { status: 500 });
  }

  // Devuelve una respuesta exitosa con los encabezados CORS permitidos
  return new Response("Message sent successfully", {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": origin,
    },
  });
});