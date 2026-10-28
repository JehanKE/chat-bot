import { Suspense } from 'react';
import { ChatContainer } from '../components/ChatContainer';
import { auth } from '@/auth.config';

const AuthenticatedChat = async () => {
  const session = await auth();
  return <ChatContainer session={session} />;
};

const Home = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-[#212121] text-zinc-400">
          Loading...
        </div>
      }
    >
      <AuthenticatedChat />
    </Suspense>
  );
};

export default Home;
