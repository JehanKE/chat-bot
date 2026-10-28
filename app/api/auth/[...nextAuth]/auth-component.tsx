import { signIn, signOut } from "@/auth.config";

export const SignIn = ({
  provider = "google",
  className,
  children,
}: {
  provider?: string;
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <form
      action={async () => {
        "use server";
        await signIn(provider);
      }}
      className="w-full"
    >
      <button type="submit" className={className}>
        {children ?? "Sign In"}
      </button>
    </form>
  );
};

export const SignOut = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
      className="w-full"
    >
      <button type="submit" className={className}>
        {children ?? "Sign Out"}
      </button>
    </form>
  );
};
