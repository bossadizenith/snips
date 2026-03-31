"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import useHotkeys from "@/hooks/useHotkeys";
import { cn } from "@/lib/utils";
import { codeAtom, selectedLanguageAtom } from "@/store/code";
import formatCode, { formatterSupportedLanguages } from "@/utils/formatCode";
import { WandIcon } from "@raycast/icons";
import { useAtom } from "jotai";

const FormatButton: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useAtom(selectedLanguageAtom);
  const [code, setCode] = useAtom(codeAtom);
  // const [isClient, setIsClient] = useState(false);

  const handleFormatCode = () => {
    const isSupportedLanguage = formatterSupportedLanguages.includes(
      selectedLanguage?.name || "",
    );
    if (!isSupportedLanguage) {
      return toast.error("Formatting is not supported for this language");
    }
    if (!code || !selectedLanguage) {
      return;
    }
    const language = selectedLanguage;
    toast.promise(
      formatCode(code, language).then((formatted) => {
        setCode(formatted);
        // Sometimes hljs thinks the formatted code is a different language
        // than the original, so we enforce the original language here
        setSelectedLanguage(language);
      }),
      {
        loading: "Formatting code...",
        success: "Formatted code!",
        error: (error) => {
          const errorMessage = error.message;
          return {
            message: "Code formatting failed",
            description: () => (
              <pre className="w-full overflow-auto text-xs scrollbar-hide bg-gray-a3 p-2.5 rounded max-w-75">
                <code className="w-full">{errorMessage}</code>
              </pre>
            ),
          };
        },
      },
    );
  };

  useHotkeys("shift+option+f", (event) => {
    event.preventDefault();
    handleFormatCode();
  });

  return (
    <Button
      onClick={handleFormatCode}
      variant="transparent"
      className={cn(
        "hidden",
        selectedLanguage &&
          formatterSupportedLanguages.includes(selectedLanguage.name) &&
          "md:inline-flex",
      )}
    >
      <WandIcon width={16} height={16} />
      Format Code
    </Button>
  );
};

export default FormatButton;
