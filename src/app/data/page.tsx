"use client";

import React, { useMemo } from "react";

export default function DataPage() {
  const styles = useMemo(
    () => ({
      page: {
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
        background: "linear-gradient(180deg, #1b1b1bff, #090909ff)",
        minHeight: "100dvh",
        color: "#ffffffff",
        padding: "32px",
      },
      headerCapsule: {
        display: "flex",
        alignItems: "center",
        gap: 500,
        margin: "0 auto 32px",
        padding: "5px 25px",
        borderRadius: 23,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "0 8px 28px rgba(0,0,0,0.35)",
        width: "fit-content",
        userSelect: "none",
        position: "sticky",
        top: 12,
        zIndex: 50,
        backdropFilter: "blur(10px)",
      } as React.CSSProperties,
      headerImage: {
        display: "block",
        width: 140,
        height: "auto",
      } as React.CSSProperties,
      footer: {
        marginTop: 40,
        padding: "20px",
        borderRadius: 20,
        textAlign: "center",
        opacity: 0.8,
      } as React.CSSProperties,
    }),
    []
  );

  const paragraphStyle = { marginBottom: "12px", lineHeight: "1.6" };
  const strongStyle = { display: "block", marginTop: "16px", marginBottom: "6px", fontSize: "18px" };
  const standStyle = { marginTop: "16px", opacity: 0.8, fontSize: "14px" };

  return (
    <div style={styles.page}>
      <header style={styles.headerCapsule as React.CSSProperties}>
        <a href="/" style={{ display: "block" }}>
          <img
            src="/GameCardLogo.png"
            alt="GameCard placeholder logo"
            style={styles.headerImage as React.CSSProperties}
          />
        </a>
      </header>

      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: "bold" }}>Impressum</h2>
          <p style={paragraphStyle}><strong style={strongStyle}>Verantwortlich gemäß § 5 TMG</strong></p>
          <p style={paragraphStyle}>Tim Veer</p>
          <p style={paragraphStyle}>Stresemannstr. 18</p>
          <p style={paragraphStyle}>44328 Dortmund</p>
          <p style={paragraphStyle}>Deutschland</p>

          <p style={paragraphStyle}><strong style={strongStyle}>Kontakt</strong></p>
          <p style={paragraphStyle}>E-Mail: timveer@yahoo.com</p>

          <p style={standStyle}>Stand: {new Date().toLocaleDateString('de-DE')}</p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: "bold" }}>Datenschutzerklärung</h2>
          <p style={paragraphStyle}><strong style={strongStyle}>1. Verantwortlicher</strong></p>
          <p style={paragraphStyle}>Tim Veer, Stresemannstr. 18</p>
          <p style={paragraphStyle}>E-Mail: timveer@yahoo.com</p>

          <p style={paragraphStyle}><strong style={strongStyle}>2. Welche Daten wir verarbeiten</strong></p>
          <p style={paragraphStyle}>Ich betreibe keine Konten/Registrierung. Es werden keine Namen, Passwörter oder vergleichbare Daten gespeichert. Technisch bedingt können jedoch folgende Daten verarbeitet werden:</p>
          <p style={paragraphStyle}>• IP-Adresse und Geräteinformationen beim Abruf von Inhalten<br/>• Nutzungsdaten (z. B. Seitenaufrufe innerhalb der App)<br/>• Absturz- und Leistungsdaten (sofern vom Betriebssystem übertragen)</p>

          <p style={paragraphStyle}><strong style={strongStyle}>3. Zwecke und Rechtsgrundlagen</strong></p>
          <p style={paragraphStyle}>• Bereitstellung der App-Funktionen (Art. 6 Abs. 1 lit. b DSGVO)<br/>• Berechtigtes Interesse an Stabilität/Sicherheit (Art. 6 Abs. 1 lit. f DSGVO)<br/>• Einwilligung, sofern du bestimmte freiwillige Funktionen aktivierst (Art. 6 Abs. 1 lit. a DSGVO)</p>

          <p style={paragraphStyle}><strong style={strongStyle}>4. Drittanbieter & Datenübermittlung</strong></p>
          <p style={paragraphStyle}>Die App ruft Inhalte (z. B. Cover, Screenshots, Metadaten) aus unserer eigenen Datenbank ab. Technisch bedingt können hierbei Daten wie IP-Adresse und Zeitstempel anfallen.</p>
          <p style={paragraphStyle}>Dabei können insbesondere IP-Adresse, Zeitstempel und angeforderte Ressourcen in Server-Logs anfallen. Eine Übermittlung in Drittländer kann stattfinden, wenn die Server dieser Anbieter dort betrieben werden.</p>

          <p style={paragraphStyle}><strong style={strongStyle}>5. Speicherdauer</strong></p>
          <p style={paragraphStyle}>Wir speichern personenbezogene Daten nur so lange, wie es für die jeweiligen Zwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen. Protokolldaten werden in der Regel kurzfristig gelöscht.</p>

          <p style={paragraphStyle}><strong style={strongStyle}>6. Deine Rechte</strong></p>
          <p style={paragraphStyle}>Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit sowie Widerspruch. Wende dich dazu an die oben genannte Kontaktadresse.</p>

          <p style={paragraphStyle}><strong style={strongStyle}>7. Widerruf von Einwilligungen</strong></p>
          <p style={paragraphStyle}>Du kannst erteilte Einwilligungen jederzeit mit Wirkung für die Zukunft widerrufen.</p>

          <p style={paragraphStyle}><strong style={strongStyle}>8. Beschwerderecht</strong></p>
          <p style={paragraphStyle}>Du hast das Recht, dich bei einer Aufsichtsbehörde zu beschweren, insbesondere in dem Mitgliedstaat deines gewöhnlichen Aufenthaltsorts, deines Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes.</p>

          <p style={paragraphStyle}><strong style={strongStyle}>9. Änderungen</strong></p>
          <p style={paragraphStyle}>Wir passen diese Datenschutzerklärung an, wenn sich Funktionen oder Rechtslagen ändern.</p>

          <p style={standStyle}>Stand: {new Date().toLocaleDateString('de-DE')}</p>

          <hr style={{ margin: "32px 0", opacity: 0.3 }} />

          <p style={paragraphStyle}><strong style={strongStyle}>1. Controller</strong></p>
          <p style={paragraphStyle}>Tim Veer, Stresemannstr. 18</p>
          <p style={paragraphStyle}>E-Mail: timveer@yahoo.com</p>

          <p style={paragraphStyle}><strong style={strongStyle}>2. What data we process</strong></p>
          <p style={paragraphStyle}>I do not operate accounts/registration. No names, passwords, or comparable data are stored. However, technically the following data may be processed:</p>
          <p style={paragraphStyle}>• IP address and device information when accessing content<br/>• Usage data (e.g., page views within the app)<br/>• Crash and performance data (if transmitted by the operating system)</p>

          <p style={paragraphStyle}><strong style={strongStyle}>3. Purposes and legal bases</strong></p>
          <p style={paragraphStyle}>• Provision of app functions (Art. 6 para. 1 lit. b GDPR)<br/>• Legitimate interest in stability/security (Art. 6 para. 1 lit. f GDPR)<br/>• Consent, if you activate certain voluntary functions (Art. 6 para. 1 lit. a GDPR)</p>

          <p style={paragraphStyle}><strong style={strongStyle}>4. Third parties & data transfer</strong></p>
          <p style={paragraphStyle}>The app retrieves content (e.g., covers, screenshots, metadata) from our own database. Technically, data such as IP address and timestamp may be generated.</p>
          <p style={paragraphStyle}>In particular, IP address, timestamp, and requested resources may be logged on servers. Transfer to third countries may occur if the servers of these providers are operated there.</p>

          <p style={paragraphStyle}><strong style={strongStyle}>5. Storage duration</strong></p>
          <p style={paragraphStyle}>We store personal data only as long as necessary for the respective purposes or as required by legal retention periods. Log data is usually deleted shortly after.</p>

          <p style={paragraphStyle}><strong style={strongStyle}>6. Your rights</strong></p>
          <p style={paragraphStyle}>You have the right to access, correct, delete, restrict processing, data portability, and object. Please contact the address above.</p>

          <p style={paragraphStyle}><strong style={strongStyle}>7. Withdrawal of consent</strong></p>
          <p style={paragraphStyle}>You can withdraw given consents at any time with effect for the future.</p>

          <p style={paragraphStyle}><strong style={strongStyle}>8. Right to complain</strong></p>
          <p style={paragraphStyle}>You have the right to complain to a supervisory authority, especially in the member state of your habitual residence, workplace, or place of the alleged infringement.</p>

          <p style={paragraphStyle}><strong style={strongStyle}>9. Changes</strong></p>
          <p style={paragraphStyle}>We adapt this privacy policy if functions or legal conditions change.</p>

          <p style={standStyle}>Status: {new Date().toLocaleDateString('en-US')}</p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: "bold" }}>Takedown Policy</h2>
          <p style={paragraphStyle}><strong style={strongStyle}>1. Zweck</strong></p>
          <p style={paragraphStyle}>Diese Richtlinie beschreibt, wie Urheber:innen und Rechteinhaber:innen die Entfernung von Inhalten (z. B. Spieleinträge, Cover, Screenshots, Beschreibungen) aus der App veranlassen können (Notice-and-Takedown-Verfahren).</p>

          <p style={paragraphStyle}><strong style={strongStyle}>2. Kontakt</strong></p>
          <p style={paragraphStyle}>Bitte sende eine E-Mail an timveer@yahoo.com mit dem Betreff "Takedown Request".</p>

          <p style={paragraphStyle}><strong style={strongStyle}>3. Erforderliche Angaben</strong></p>
          <p style={paragraphStyle}>• Titel des Spiels und ggf. Link zur betroffenen Seite<br/>• Beschreibung, welche Inhalte entfernt werden sollen<br/>• Erklärung, dass du Inhaber:in der Rechte bist oder im Namen des/der Rechteinhaber:in handelst<br/>• Eine Kontaktmöglichkeit für Rückfragen</p>

          <p style={paragraphStyle}><strong style={strongStyle}>4. Verfahren</strong></p>
          <p style={paragraphStyle}>Nach Eingang einer ausreichend begründeten Anfrage prüfen wir diese zügig und entfernen die genannten Inhalte, sofern die Rechteinhaberschaft plausibel dargelegt ist. Bei Unklarheiten melden wir uns per E-Mail zurück.</p>

          <p style={paragraphStyle}><strong style={strongStyle}>5. Missbrauch</strong></p>
          <p style={paragraphStyle}>Unberechtigte oder missbräuchliche Meldungen können zurückgewiesen werden.</p>

          <p style={standStyle}>Stand: {new Date().toLocaleDateString('de-DE')}</p>

          <hr style={{ margin: "32px 0", opacity: 0.3 }} />

          <p style={paragraphStyle}><strong style={strongStyle}>1. Purpose</strong></p>
          <p style={paragraphStyle}>This policy describes how copyright holders and rights owners can request the removal of content (e.g., game entries, covers, screenshots, descriptions) from the app (notice-and-takedown procedure).</p>

          <p style={paragraphStyle}><strong style={strongStyle}>2. Contact</strong></p>
          <p style={paragraphStyle}>Please send an email to timveer@yahoo.com with the subject "Takedown Request".</p>

          <p style={paragraphStyle}><strong style={strongStyle}>3. Required information</strong></p>
          <p style={paragraphStyle}>• Title of the game and, if applicable, link to the affected page<br/>• Description of which content should be removed<br/>• Declaration that you are the rights holder or act on behalf of the rights holder<br/>• A contact option for inquiries</p>

          <p style={paragraphStyle}><strong style={strongStyle}>4. Procedure</strong></p>
          <p style={paragraphStyle}>Upon receipt of a sufficiently substantiated request, we will promptly review it and remove the specified content if the rights ownership is plausibly demonstrated. In case of uncertainties, we will contact you by email.</p>

          <p style={paragraphStyle}><strong style={strongStyle}>5. Abuse</strong></p>
          <p style={paragraphStyle}>Unauthorized or abusive reports may be rejected.</p>

          <p style={standStyle}>Status: {new Date().toLocaleDateString('en-US')}</p>
        </section>
      </div>

      <footer style={styles.footer as React.CSSProperties}>2025 IndieDeck</footer>
    </div>
  );
}
