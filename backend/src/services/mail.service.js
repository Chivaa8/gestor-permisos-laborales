import nodemailer from "nodemailer";

function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendPasswordResetEmail({ to, resetUrl }) {
  const subject = "Recuperacion de contraseña";
  const text = [
    "Has solicitado cambiar tu contraseña.",
    "Este enlace caduca en 5 minutos:",
    resetUrl,
    "Si no has sido tu, ignora este correo.",
  ].join("\n\n");

  if (!smtpConfigured()) {
    console.log(`[password-reset] SMTP no configurado. Enlace de recuperacion para ${to}: ${resetUrl}`);
    return { sent: false, reason: "SMTP_NOT_CONFIGURED" };
  }

  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html: `
      <p>Has solicitado cambiar tu contraseña.</p>
      <p>Este enlace caduca en <strong>5 minutos</strong>:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Si no has sido tu, ignora este correo.</p>
    `,
  });

  return { sent: true };
}

export async function sendVacationApprovedEmail({
  to,
  nombre,
  tipo,
  fechaInicio,
  fechaFin,
  dias,
  restantes,
  year,
}) {
  const nombres = {
    vacaciones: "vacaciones",
    personales: "dias personales",
    no_retribuidos: "dias no retribuidos",
  };
  const tipoTexto = nombres[tipo] || tipo;
  const formato = new Intl.DateTimeFormat("es-ES", { dateStyle: "long", timeZone: "UTC" });
  const subject = `Solicitud de ${tipoTexto} aprobada`;
  const text = [
    `Hola ${nombre},`,
    `Tu solicitud de ${tipoTexto}, del ${formato.format(fechaInicio)} al ${formato.format(fechaFin)}, ha sido aprobada.`,
    `Dias aprobados: ${dias}.`,
    `Te quedan ${restantes} dias de ${tipoTexto} disponibles en ${year}.`,
  ].join("\n\n");

  if (!smtpConfigured()) {
    console.log(`[vacaciones] SMTP no configurado. Notificacion para ${to}: ${text}`);
    return { sent: false, reason: "SMTP_NOT_CONFIGURED" };
  }

  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html: `
      <h2>Solicitud aprobada</h2>
      <p>Hola <strong>${nombre}</strong>,</p>
      <p>Tu solicitud de <strong>${tipoTexto}</strong>, del ${formato.format(fechaInicio)} al ${formato.format(fechaFin)}, ha sido aprobada.</p>
      <p>Dias aprobados: <strong>${dias}</strong>.</p>
      <p>Te quedan <strong>${restantes} dias</strong> de ${tipoTexto} disponibles en ${year}.</p>
    `,
  });
  return { sent: true };
}
