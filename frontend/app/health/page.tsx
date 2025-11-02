export default function Health() {
  return new Response(JSON.stringify({ status: "healthy" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
