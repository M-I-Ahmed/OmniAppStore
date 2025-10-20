"use client";

export default function AppDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-8 pt-32">
      <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          App Details: {decodeURIComponent(params.id)}
        </h1>
      </div>
    </div>
  );
}