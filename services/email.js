"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendRankingUpdateEmail = exports.sendVerificationCode = exports.sendEmail = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const config_1 = require("../config");
const ses = new aws_sdk_1.default.SES({
    region: process.env.AWS_REGION || 'us-east-1',
});
const sendEmail = async ({ to, subject, html }) => {
    try {
        await ses.sendEmail({
            Source: config_1.config.aws.sesFromEmail,
            Destination: {
                ToAddresses: [to],
            },
            Message: {
                Subject: {
                    Data: subject,
                    Charset: 'UTF-8',
                },
                Body: {
                    Html: {
                        Data: html,
                        Charset: 'UTF-8',
                    },
                },
            },
        }).promise();
    }
    catch (error) {
        console.error('SES send error:', error);
        throw error;
    }
};
exports.sendEmail = sendEmail;
const sendRankingUpdateEmail = async (userEmail, userName, newPosition, previousPosition, points) => {
    const movement = previousPosition ? (previousPosition - newPosition) : 0;
    let emoji = '';
    let message = '';
    if (movement > 0) {
        emoji = '📈';
        message = `Subiste ${movement} posición${movement > 1 ? 'es' : ''}!`;
    }
    else if (movement < 0) {
        emoji = '📉';
        message = `Bajaste ${Math.abs(movement)} posición${Math.abs(movement) > 1 ? 'es' : ''}`;
    }
    else if (previousPosition === null) {
        emoji = '🎉';
        message = '¡Bienvenido al ranking!';
    }
    else {
        emoji = '➖';
        message = 'Mantuviste tu posición';
    }
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; }
        h1 { color: #1a56db; }
        .ranking { background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .position { font-size: 48px; font-weight: bold; color: #1a56db; }
        .points { color: #6b7280; }
        .footer { text-align: center; color: #9ca3af; margin-top: 20px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🏆 PRODE Caballito</h1>
        <p>Hola ${userName},</p>
        <p>${emoji} ${message}</p>
        <div class="ranking">
          <div class="position">#${newPosition}</div>
          <div class="points">${points} puntos</div>
        </div>
        <p>Ver todos los resultados en: <a href="https://d2vjb37mnj30m1.cloudfront.net/ranking">PRODE Caballito</a></p>
        <div class="footer">
          © 2026 PRODE Caballito
        </div>
      </div>
    </body>
    </html>
  `;
    await (0, exports.sendEmail)({
        to: userEmail,
        subject: `🏆 PRODE Caballito - Posición #${newPosition}`,
        html,
    });
};
exports.sendRankingUpdateEmail = sendRankingUpdateEmail;
const sendWelcomeEmail = async (email, nombre) => {
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¡Bienvenido! - PRODE Caballito</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background: linear-gradient(135deg, #0042A5 0%, #001A4B 100%); min-height: 100vh;">
  
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="display: inline-block; background: rgba(255,255,255,0.1); border-radius: 50%; width: 80px; height: 80px; line-height: 80px; margin-bottom: 20px;">
        <span style="font-size: 40px;">⚽</span>
      </div>
      <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 800;">¡BIENVENIDO A PRODE!</h1>
      <p style="color: #FFDF00; margin: 10px 0 0 0; font-size: 18px; font-weight: 600;">🔥 Mundial 2026 · USA · Canadá · México 🔥</p>
    </div>
    
    <!-- Main Card -->
    <div style="background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
      
      <!-- Celebration Header -->
      <div style="background: linear-gradient(135deg, #FFDF00 0%, #FFA500 100%); padding: 40px 30px; text-align: center;">
        <div style="font-size: 60px; margin-bottom: 15px;">🎉</div>
        <h2 style="color: #001A4B; margin: 0; font-size: 28px; font-weight: 800;">¡${nombre} ya sos parte del PRODE!</h2>
        <p style="color: #0042A5; margin: 15px 0 0 0; font-size: 16px;">Tu cuenta fue activada exitosamente</p>
      </div>
      
      <!-- Content -->
      <div style="padding: 40px 30px;">
        
        <p style="color: #374151; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0;">
          ¡Hola <strong>${nombre}</strong>! 👋
        </p>
        
        <p style="color: #4B5563; font-size: 15px; line-height: 1.8; margin: 0 0 30px 0;">
          ¡Bienvenido al <strong style="color: #0042A5;">PRODE Caballito</strong>!
          El Mundial 2026 llega a USA, Canadá y México — y vos ya sos parte de la acción. Apostá, acumulá puntos y
          <span style="background: linear-gradient(135deg, #FFDF00, #FFA500); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">¡subí al primer puesto del ranking!</span>
        </p>
        
        <!-- How to Play -->
        <div style="background: #F9FAFB; border-radius: 16px; padding: 25px; margin-bottom: 30px;">
          <h3 style="color: #0042A5; margin: 0 0 20px 0; font-size: 18px;">🚀 ¿Cómo empezar?</h3>
          <div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
            <div style="background: #0042A5; color: white; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-size: 14px; font-weight: bold; margin-right: 15px; flex-shrink: 0;">1</div>
            <div>
              <p style="color: #1F2937; margin: 0; font-weight: 600;">Apostá en los partidos</p>
              <p style="color: #6B7280; margin: 5px 0 0 0; font-size: 14px;">Elegí los resultados de cada partido del mundial</p>
            </div>
          </div>
          <div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
            <div style="background: #0042A5; color: white; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-size: 14px; font-weight: bold; margin-right: 15px; flex-shrink: 0;">2</div>
            <div>
              <p style="color: #1F2937; margin: 0; font-weight: 600;">Acumulá puntos</p>
              <p style="color: #6B7280; margin: 5px 0 0 0; font-size: 14px;">Cada acierto te acerca al primer puesto del ranking</p>
            </div>
          </div>
          <div style="display: flex; align-items: flex-start;">
            <div style="background: #FFDF00; color: #001A4B; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-size: 14px; font-weight: bold; margin-right: 15px; flex-shrink: 0;">3</div>
            <div>
              <p style="color: #1F2937; margin: 0; font-weight: 600;">¡Ganá premios!</p>
              <p style="color: #6B7280; margin: 5px 0 0 0; font-size: 14px;">Los mejores del ranking se llevan premios increíbles</p>
            </div>
          </div>
        </div>
        
        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="https://d2vjb37mnj30m1.cloudfront.net/matches" style="display: inline-block; background: linear-gradient(135deg, #0042A5 0%, #001A4B 100%); color: white; text-decoration: none; padding: 18px 40px; border-radius: 50px; font-size: 18px; font-weight: 700; box-shadow: 0 4px 15px rgba(0,66,165,0.4);">
            ⚽ ¡Ver Partidos y Apostar!
          </a>
        </div>
        
        <!-- Good Luck Message -->
        <div style="background: linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%); border-radius: 16px; padding: 25px; text-align: center; margin-bottom: 20px;">
          <div style="font-size: 40px; margin-bottom: 10px;">🍀</div>
          <h3 style="color: #166534; margin: 0 0 10px 0; font-size: 20px;">¡Que empiece el juego!</h3>
          <p style="color: #15803D; margin: 0; font-size: 15px;">
            Cada partido es una oportunidad. Cada pronóstico, un paso hacia la gloria. ¡El ranking te espera — mostrá de qué estás hecho!
          </p>
        </div>
        
        <p style="color: #9CA3AF; font-size: 13px; text-align: center; margin: 30px 0 0 0;">
          Con cariño, el equipo de <strong>PRODE Caballito</strong> 💙
        </p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; margin-top: 30px; color: rgba(255,255,255,0.6); font-size: 12px;">
      <p style="margin: 0 0 10px 0;">© 2026 PRODE Caballito · Mundial 2026</p>
      <p style="margin: 0;">
        <a href="https://d2vjb37mnj30m1.cloudfront.net" style="color: rgba(255,255,255,0.8); text-decoration: none;">www.prodecaballito.com</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
    await (0, exports.sendEmail)({
        to: email,
        subject: `🔥 ¡${nombre}, el Mundial 2026 arranca — ya sos parte del PRODE!`,
        html,
    });
};
exports.sendWelcomeEmail = sendWelcomeEmail;
const sendVerificationCode = async (email, nombre, code) => {
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Código de Verificación - PRODE Caballito</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0042A5 0%, #001A4B 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 28px;">⚽ PRODE Caballito</h1>
      <p style="color: #FFDF00; margin: 10px 0 0 0; font-size: 14px;">⚡ Mundial 2026</p>
    </div>
    <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <h2 style="color: #1F2937; margin-top: 0;">¡Hola ${nombre}! 👋</h2>
      <p style="color: #4B5563; line-height: 1.6;">
        Gracias por registrarte en PRODE Caballito. Para completar tu registro, 
        usa el siguiente código de verificación:
      </p>
      <div style="background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%); padding: 30px; margin: 30px 0; text-align: center; border-radius: 12px; border: 3px dashed #0042A5;">
        <p style="color: #6B7280; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">
          Tu Código
        </p>
        <div style="font-size: 42px; font-weight: bold; color: #0042A5; letter-spacing: 12px; font-family: 'Courier New', monospace;">
          ${code}
        </div>
      </div>
      <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 6px;">
        <p style="color: #92400E; margin: 0; font-size: 14px;">
          ⏱️ <strong>Este código expira en 15 minutos.</strong>
        </p>
      </div>
      <p style="color: #4B5563; line-height: 1.6; margin-top: 30px;">
        Si no solicitaste este código, puedes ignorar este email.
      </p>
    </div>
    <div style="text-align: center; padding: 20px; color: #9CA3AF; font-size: 12px;">
      <p style="margin: 5px 0;">© 2026 PRODE Caballito - Qatar 2026</p>
      <p style="margin: 5px 0;">Este es un email automático, por favor no respondas.</p>
    </div>
  </div>
</body>
</html>
  `;
    await (0, exports.sendEmail)({
        to: email,
        subject: '🎯 Código de Verificación - PRODE Caballito',
        html,
    });
};
exports.sendVerificationCode = sendVerificationCode;
//# sourceMappingURL=email.js.map