"use client";

import React from "react";
import { useAtom, useAtomValue } from "jotai";
import { 
  exportFPSAtom, 
  exportHoldDurationAtom, 
  exportTransitionDurationAtom, 
  exportResolutionAtom,
  RESOLUTIONS,
  type Resolution
} from "@/store/export";
import { showBackgroundAtom, showLineNumbersAtom } from "@/store";
import { selectedLanguageAtom } from "@/store/code";
import { themeAtom, themeDarkModeAtom, darkModeAtom, THEMES, type Theme } from "@/store/themes";
import { fontAtom, FONTS, type Font } from "@/store/font";
import { paddingAtom, PADDING_OPTIONS } from "@/store/padding";
import { Language, LANGUAGES } from "@/utils/languages";
import styles from "./slides.module.css";
import { Switch } from "@/components/ui/switch";
import { 
  Combobox, 
  ComboboxContent, 
  ComboboxItem, 
  ComboboxList, 
  ComboboxTrigger, 
  ComboboxValue,
  ComboboxEmpty
} from "@/components/ui/combobox";
import { ChevronUpIcon } from "@raycast/icons";
import { cn } from "@/lib/utils";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className={styles.settingsSection}>
    <h3 className={styles.sectionTitle}>{title}</h3>
    {children}
  </section>
);

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className={styles.controlRow}>
    <span className={styles.controlLabel}>{label}</span>
    {children}
  </div>
);

export const SettingsPanel = () => {
  const [theme, setTheme] = useAtom(themeAtom);
  const [darkMode, setDarkMode] = useAtom(darkModeAtom);
  const [showBackground, setShowBackground] = useAtom(showBackgroundAtom);
  const [font, setFont] = useAtom(fontAtom);
  
  const [language, setLanguage] = useAtom(selectedLanguageAtom);
  
  const [fps, setFps] = useAtom(exportFPSAtom);
  const [hold, setHold] = useAtom(exportHoldDurationAtom);
  const [transition, setTransition] = useAtom(exportTransitionDurationAtom);
  const [resolution, setResolution] = useAtom(exportResolutionAtom);

  return (
    <div className={styles.settingsPanel}>
      <Section title="Appearance">
        <Row label="Theme">
          <Combobox<Theme>
            items={Object.values(THEMES)}
            value={theme}
            onValueChange={(val) => val && setTheme(val)}
            itemToStringLabel={(item) => item?.name ?? ""}
          >
            <ComboboxTrigger size="small" className="w-30" icon={ChevronUpIcon}>
              <ComboboxValue<Theme>>{(val) => val?.name ?? "Select"}</ComboboxValue>
            </ComboboxTrigger>
            <ComboboxContent>
              <ComboboxEmpty>No themes.</ComboboxEmpty>
              <ComboboxList<Theme>>
                {(item) => (
                  <ComboboxItem key={item.id} value={item}>
                    {item.name}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </Row>

        <Row label="Dark Mode">
          <Switch checked={darkMode} onCheckedChange={(checked) => { setDarkMode(checked); }} />
        </Row>

        <Row label="Background">
          <Switch checked={showBackground} onCheckedChange={(checked) => { setShowBackground(checked); }} />
        </Row>

        <Row label="Font">
          <Combobox<Font>
            items={[...FONTS]}
            value={font}
            onValueChange={(val) => val && setFont(val)}
            itemToStringLabel={(item) => item ?? ""}
          >
            <ComboboxTrigger size="small" className="w-30" icon={ChevronUpIcon}>
              <ComboboxValue<Font>>{(val) => val?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') ?? "Select"}</ComboboxValue>
            </ComboboxTrigger>
            <ComboboxContent>
              <ComboboxList<Font>>
                {(item) => (
                  <ComboboxItem key={item} value={item}>
                    {item.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </Row>
      </Section>

      <Section title="Code">
        <Row label="Language">
          <Combobox<Language | null>
            items={[null, ...Object.values(LANGUAGES)]}
            value={language}
            onValueChange={(val) => setLanguage(val)}
            itemToStringLabel={(item) => item?.name ?? "Auto-Detect"}
          >
            <ComboboxTrigger size="small" className="w-30" icon={ChevronUpIcon}>
              <ComboboxValue<Language | null>>{(val) => val?.name ?? "Auto-Detect"}</ComboboxValue>
            </ComboboxTrigger>
            <ComboboxContent>
              <ComboboxEmpty>No languages.</ComboboxEmpty>
              <ComboboxList<Language | null>>
                {(item) => (
                  <ComboboxItem key={item?.name ?? "auto"} value={item}>
                    {item?.name ?? "Auto-Detect"}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </Row>
      </Section>

      <Section title="Video Export">
        <Row label="FPS">
          <select 
            className={styles.numericInput}
            value={fps}
            onChange={(e) => setFps(Number(e.target.value))}
          >
            <option value={30}>30</option>
            <option value={60}>60</option>
          </select>
        </Row>

        <Row label="Hold (ms)">
          <input 
            type="number"
            className={styles.numericInput}
            value={hold}
            onChange={(e) => setHold(Number(e.target.value))}
            step={500}
            min={0}
          />
        </Row>

        <Row label="Morph (ms)">
          <input 
            type="number"
            className={styles.numericInput}
            value={transition}
            onChange={(e) => setTransition(Number(e.target.value))}
            step={100}
            min={0}
          />
        </Row>

        <Row label="Resolution">
          <Combobox<Resolution>
            items={RESOLUTIONS}
            value={resolution}
            onValueChange={(val) => val && setResolution(val)}
            itemToStringLabel={(item) => item?.name ?? ""}
          >
            <ComboboxTrigger size="small" className="w-30" icon={ChevronUpIcon}>
              <ComboboxValue<Resolution>>{(val) => val?.id.toUpperCase() ?? "1080P"}</ComboboxValue>
            </ComboboxTrigger>
            <ComboboxContent>
              <ComboboxList<Resolution>>
                {(item) => (
                  <ComboboxItem key={item.id} value={item}>
                    {item.name}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </Row>
      </Section>
    </div>
  );
};
