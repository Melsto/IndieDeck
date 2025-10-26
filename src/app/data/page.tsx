"use client";

import React, { useMemo } from "react";

export default function DataPage() {
  const styles = useMemo(
    () => ({
      page: {
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
        background: "#111",
        minHeight: "100dvh",
        color: "#ffffffff",
        padding: "24px",
        overflow: "hidden auto",
        height: "100vh",
        width: "100vw",
        position: "fixed",
        top: 0,
        left: 0,
      } as React.CSSProperties,
      logo: {
        position: "absolute",
        top: 0,
        left: 35,
        zIndex: 2001,
        pointerEvents: "auto",
      } as React.CSSProperties,
      container: {
        display: "flex",
        flexDirection: "row" as const,
        alignItems: "flex-start",
        justifyContent: "center",
        margin: "0 auto",
        height: "100%",
        position: "relative",
        zIndex: 1,
        padding: 10,
        maxWidth: "800px",
        width: "100%",
        boxSizing: "border-box",
      } as React.CSSProperties,
      mainContent: {
        flex: 1,
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "stretch",
        justifyContent: "flex-start",
        paddingTop: "40px",
        gap: 24,
      } as React.CSSProperties,
      headline: {
        fontSize: "2rem",
        fontWeight: 700,
        color: "#fff",
        textAlign: "left" as const,
        alignSelf: "flex-start",
      } as React.CSSProperties,
      section: {
        background: "#1a1a1a",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 12,
        padding: 16,
      } as React.CSSProperties,
      h2: { fontSize: 22, fontWeight: 800, margin: 0, marginBottom: 12 } as React.CSSProperties,
      p: { marginBottom: 12, lineHeight: 1.6 } as React.CSSProperties,
      strongBlock: { display: "block", marginTop: 16, marginBottom: 6, fontSize: 18 } as React.CSSProperties,
      muted: { marginTop: 16, opacity: 0.8, fontSize: 14 } as React.CSSProperties,
      hr: { margin: "24px 0", opacity: 0.2 } as React.CSSProperties,
      footer: {
        marginTop: 8,
        padding: "8px 0",
        textAlign: "center" as const,
        opacity: 0.7,
      } as React.CSSProperties,
    }),
    []
  );

  return (
    <div style={styles.page}>

      <div style={styles.logo}>
        <a href="/">
          <img
            src="/logo.svg"
            alt="Logo"
            style={{ width: "110px", height: "90px", display: "block", pointerEvents: "auto" }}
          />
        </a>
      </div>

      <div style={styles.container}>
        <div style={styles.mainContent}>
          <h1 style={styles.headline}>Legal</h1>

          {/* Impressum */}
          <section style={styles.section}>
            <h2 style={styles.h2}>Impressum</h2>
            <p style={styles.p}><strong style={styles.strongBlock}>Verantwortlich gemäß § 5 TMG</strong></p>
            <p style={styles.p}>Tim Veer</p>
            <p style={styles.p}>Stresemannstr. 18</p>
            <p style={styles.p}>44328 Dortmund</p>
            <p style={styles.p}>Deutschland</p>

            <p style={styles.p}><strong style={styles.strongBlock}>Kontakt</strong></p>
            <p style={styles.p}>E-Mail: timveer@yahoo.com</p>

            <p style={styles.muted}>Stand: {new Date().toLocaleDateString('de-DE')}</p>
          </section>

          {/* Datenschutzerklärung / Privacy */}
          <section style={styles.section}>
            <h2 style={styles.h2}>Datenschutzerklärung</h2>
            <p style={styles.p}><strong style={styles.strongBlock}>1. Verantwortlicher</strong></p>
            <p style={styles.p}>Tim Veer, Stresemannstr. 18</p>
            <p style={styles.p}>E-Mail: timveer@yahoo.com</p>

            <p style={styles.p}><strong style={styles.strongBlock}>2. Welche Daten wir verarbeiten</strong></p>
            <p style={styles.p}>Ich betreibe keine Konten/Registrierung. Es werden keine Namen, Passwörter oder vergleichbare Daten gespeichert. Technisch bedingt können jedoch folgende Daten verarbeitet werden:</p>
            <p style={styles.p}>• IP-Adresse und Geräteinformationen beim Abruf von Inhalten<br/>• Nutzungsdaten (z. B. Seitenaufrufe innerhalb der App)<br/></p>

            <p style={styles.p}><strong style={styles.strongBlock}>3. Zwecke und Rechtsgrundlagen</strong></p>
            <p style={styles.p}>• Bereitstellung der App-Funktionen (Art. 6 Abs. 1 lit. b DSGVO)<br/>• Berechtigtes Interesse an Stabilität/Sicherheit (Art. 6 Abs. 1 lit. f DSGVO)<br/>• Einwilligung, sofern du bestimmte freiwillige Funktionen aktivierst (Art. 6 Abs. 1 lit. a DSGVO)</p>

            <p style={styles.p}><strong style={styles.strongBlock}>4. Drittanbieter & Datenübermittlung</strong></p>
            <p style={styles.p}>Die App ruft Inhalte (z. B. Cover, Screenshots, Metadaten) aus unserer eigenen Datenbank ab. Technisch bedingt können hierbei Daten wie IP-Adresse und Zeitstempel anfallen.</p>
            <p style={styles.p}>Dabei können insbesondere IP-Adresse, Zeitstempel und angeforderte Ressourcen in Server-Logs anfallen. Eine Übermittlung in Drittländer kann stattfinden, wenn die Server dieser Anbieter dort betrieben werden.</p>

            <p style={styles.p}><strong style={styles.strongBlock}>5. Speicherdauer</strong></p>
            <p style={styles.p}>Wir speichern personenbezogene Daten nur so lange, wie es für die jeweiligen Zwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen. Protokolldaten werden in der Regel kurzfristig gelöscht.</p>

            <p style={styles.p}><strong style={styles.strongBlock}>6. Deine Rechte</strong></p>
            <p style={styles.p}>Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit sowie Widerspruch. Wende dich dazu an die oben genannte Kontaktadresse.</p>

            <p style={styles.p}><strong style={styles.strongBlock}>7. Widerruf von Einwilligungen</strong></p>
            <p style={styles.p}>Du kannst erteilte Einwilligungen jederzeit mit Wirkung für die Zukunft widerrufen.</p>

            <p style={styles.p}><strong style={styles.strongBlock}>8. Beschwerderecht</strong></p>
            <p style={styles.p}>Du hast das Recht, dich bei einer Aufsichtsbehörde zu beschweren, insbesondere in dem Mitgliedstaat deines gewöhnlichen Aufenthaltsorts, deines Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes.</p>

            <p style={styles.p}><strong style={styles.strongBlock}>9. Änderungen</strong></p>
            <p style={styles.p}>Wir passen diese Datenschutzerklärung an, wenn sich Funktionen oder Rechtslagen ändern.</p>

            <p style={styles.muted}>Stand: {new Date().toLocaleDateString('de-DE')}</p>

            <hr style={styles.hr} />

            <p style={styles.p}><strong style={styles.strongBlock}>1. Controller</strong></p>
            <p style={styles.p}>Tim Veer, Stresemannstr. 18</p>
            <p style={styles.p}>E-Mail: timveer@yahoo.com</p>

            <p style={styles.p}><strong style={styles.strongBlock}>2. What data we process</strong></p>
            <p style={styles.p}>I do not operate accounts/registration. No names, passwords, or comparable data are stored. However, technically the following data may be processed:</p>
            <p style={styles.p}>• IP address and device information when accessing content<br/>• Usage data (e.g., page views within the app)<br/></p>

            <p style={styles.p}><strong style={styles.strongBlock}>3. Purposes and legal bases</strong></p>
            <p style={styles.p}>• Provision of app functions (Art. 6 para. 1 lit. b GDPR)<br/>• Legitimate interest in stability/security (Art. 6 para. 1 lit. f GDPR)<br/>• Consent, if you activate certain voluntary functions (Art. 6 para. 1 lit. a GDPR)</p>

            <p style={styles.p}><strong style={styles.strongBlock}>4. Third parties & data transfer</strong></p>
            <p style={styles.p}>The app retrieves content (e.g., covers, screenshots, metadata) from our own database. Technically, data such as IP address and timestamp may be generated.</p>
            <p style={styles.p}>In particular, IP address, timestamp, and requested resources may be logged on servers. Transfer to third countries may occur if the servers of these providers are operated there.</p>

            <p style={styles.p}><strong style={styles.strongBlock}>5. Storage duration</strong></p>
            <p style={styles.p}>We store personal data only as long as necessary for the respective purposes or as required by legal retention periods. Log data is usually deleted shortly after.</p>

            <p style={styles.p}><strong style={styles.strongBlock}>6. Your rights</strong></p>
            <p style={styles.p}>You have the right to access, correct, delete, restrict processing, data portability, and object. Please contact the address above.</p>

            <p style={styles.p}><strong style={styles.strongBlock}>7. Withdrawal of consent</strong></p>
            <p style={styles.p}>You can withdraw given consents at any time with effect for the future.</p>

            <p style={styles.p}><strong style={styles.strongBlock}>8. Right to complain</strong></p>
            <p style={styles.p}>You have the right to complain to a supervisory authority, especially in the member state of your habitual residence, workplace, or place of the alleged infringement.</p>

            <p style={styles.p}><strong style={styles.strongBlock}>9. Changes</strong></p>
            <p style={styles.p}>We adapt this privacy policy if functions or legal conditions change.</p>

            <p style={styles.muted}>Status: {new Date().toLocaleDateString('en-US')}</p>
          </section>

          {/* Takedown Policy */}
          <section style={styles.section}>
            <h2 style={styles.h2}>Takedown Policy</h2>
            <p style={styles.p}><strong style={styles.strongBlock}>1. Zweck</strong></p>
            <p style={styles.p}>Diese Richtlinie beschreibt, wie Urheber:innen und Rechteinhaber:innen die Entfernung von Inhalten (z. B. Spieleinträge, Cover, Screenshots, Beschreibungen) aus der App veranlassen können (Notice-and-Takedown-Verfahren).</p>

            <p style={styles.p}><strong style={styles.strongBlock}>2. Kontakt</strong></p>
            <p style={styles.p}>Bitte sende eine E-Mail an timveer@yahoo.com mit dem Betreff "Takedown Request".</p>

            <p style={styles.p}><strong style={styles.strongBlock}>3. Erforderliche Angaben</strong></p>
            <p style={styles.p}>• Titel des Spiels und ggf. Link zur betroffenen Seite<br/>• Beschreibung, welche Inhalte entfernt werden sollen<br/>• Erklärung, dass du Inhaber:in der Rechte bist oder im Namen des/der Rechteinhaber:in handelst<br/>• Eine Kontaktmöglichkeit für Rückfragen</p>

            <p style={styles.p}><strong style={styles.strongBlock}>4. Verfahren</strong></p>
            <p style={styles.p}>Nach Eingang einer ausreichend begründeten Anfrage prüfen wir diese zügig und entfernen die genannten Inhalte, sofern die Rechteinhaberschaft plausibel dargelegt ist. Bei Unklarheiten melden wir uns per E-Mail zurück.</p>

            <p style={styles.p}><strong style={styles.strongBlock}>5. Missbrauch</strong></p>
            <p style={styles.p}>Unberechtigte oder missbräuchliche Meldungen können zurückgewiesen werden.</p>

            <p style={styles.muted}>Stand: {new Date().toLocaleDateString('de-DE')}</p>

            <hr style={styles.hr} />

            <p style={styles.p}><strong style={styles.strongBlock}>1. Purpose</strong></p>
            <p style={styles.p}>This policy describes how copyright holders and rights owners can request the removal of content (e.g., game entries, covers, screenshots, descriptions) from the app (notice-and-takedown procedure).</p>

            <p style={styles.p}><strong style={styles.strongBlock}>2. Contact</strong></p>
            <p style={styles.p}>Please send an email to timveer@yahoo.com with the subject "Takedown Request".</p>

            <p style={styles.p}><strong style={styles.strongBlock}>3. Required information</strong></p>
            <p style={styles.p}>• Title of the game and, if applicable, link to the affected page<br/>• Description of which content should be removed<br/>• Declaration that you are the rights holder or act on behalf of the rights holder<br/>• A contact option for inquiries</p>

            <p style={styles.p}><strong style={styles.strongBlock}>4. Procedure</strong></p>
            <p style={styles.p}>Upon receipt of a sufficiently substantiated request, we will promptly review it and remove the specified content if the rights ownership is plausibly demonstrated. In case of uncertainties, we will contact you by email.</p>

            <p style={styles.p}><strong style={styles.strongBlock}>5. Abuse</strong></p>
            <p style={styles.p}>Unauthorized or abusive reports may be rejected.</p>

            <p style={styles.muted}>Status: {new Date().toLocaleDateString('en-US')}</p>
          </section>

          <footer style={styles.footer}>2025 IndieDeck</footer>
        </div>
      </div>
    </div>
  );
}
