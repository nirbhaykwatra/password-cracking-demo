export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-4xl font-bold">Cybersecurity Lab</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">Welcome to the Cybersecurity Lab. This lab is designed to help you understand the basics of cybersecurity and how to protect against cyber threats.</p>
      </main>
    </div>
  );
}
