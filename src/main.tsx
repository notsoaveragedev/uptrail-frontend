import "@fontsource-variable/instrument-sans/wdth.css";
import "@fontsource-variable/martian-mono/wdth.css";
import "./index.css";

import { StyleProvider, px2remTransformer } from "@ant-design/cssinjs";
import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { IconContext } from "react-icons";
import { RouterProvider } from "react-router";
import { QueryDevtools } from "@/components/dev/QueryDevtools";
import { queryClient } from "@/lib/queryClient";
import { router } from "@/router";
import { ThemeProvider } from "@/theme/ThemeProvider";

// antd tokens are written in px; this converts antd's generated CSS to rem (1rem = 16px).
const px2rem = px2remTransformer({ rootValue: 16 });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StyleProvider layer transformers={[px2rem]}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <IconContext value={{ attr: { strokeWidth: "1.5" } }}>
            <RouterProvider router={router} />
          </IconContext>
        </ThemeProvider>
        <QueryDevtools />
      </QueryClientProvider>
    </StyleProvider>
  </StrictMode>,
);
