import { Button } from "antd";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router";

export function OAuthButtons() {
  const navigate = useNavigate();

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <Button size="large" icon={<FaGithub />} onClick={() => navigate("/oauth/callback?provider=github")}>
          GitHub
        </Button>
        <Button size="large" icon={<FcGoogle />} onClick={() => navigate("/oauth/callback?provider=google")}>
          Google
        </Button>
      </div>
      <div className="my-6 flex items-center gap-3 font-mono text-xs text-subtle">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>
    </>
  );
}
