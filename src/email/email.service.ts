import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'
import { Transporter } from 'nodemailer'

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)
  private transporter: Transporter | null = null

  constructor(private configService: ConfigService) {
    this.initializeTransporter()
  }

  private initializeTransporter() {
    const emailService = this.configService.get<string>('EMAIL_SERVICE', 'gmail')
    const emailUser = this.configService.get<string>('EMAIL_USER')
    const emailPassword = this.configService.get<string>('EMAIL_PASSWORD')

    if (!emailUser || !emailPassword) {
      this.logger.warn('Email credentials not configured. Email notifications will be disabled.')
      return
    }

    this.transporter = nodemailer.createTransport({
      service: emailService,
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    })

    this.logger.log(`Email service initialized with ${emailService}`)
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn('Email transporter not initialized. Skipping email send.')
      return false
    }

    try {
      const result = await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_FROM', 'World Cup 2026 Predictions <noreply@worldcup2026.com>'),
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      })

      this.logger.log(`Email sent successfully to ${options.to}`)
      return true
    } catch (error: any) {
      this.logger.error(`Failed to send email to ${options.to}: ${error?.message || String(error)}`)
      return false
    }
  }

  async sendMatchReminderEmail(
    userEmail: string,
    userName: string,
    matchDetails: {
      homeTeam: string
      awayTeam: string
      kickoffTime: Date
      matchId: string
    }
  ): Promise<boolean> {
    const formattedTime = matchDetails.kickoffTime.toLocaleString('he-IL', {
      dateStyle: 'short',
      timeStyle: 'short',
    })

    const html = this.generateMatchReminderHtml(userName, matchDetails, formattedTime)
    const subject = `תזכורת: ${matchDetails.homeTeam} נגד ${matchDetails.awayTeam} - מתחיל בעוד שעתיים!`

    return this.sendEmail({
      to: userEmail,
      subject,
      html,
    })
  }

  private generateMatchReminderHtml(
    userName: string,
    matchDetails: { homeTeam: string; awayTeam: string; kickoffTime: Date; matchId: string },
    formattedTime: string
  ): string {
    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:5173')

    return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>תזכורת משחק</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
  <div style="background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #1a56db; margin: 0; font-size: 28px;">⚽ מונדיאל 2026</h1>
      <p style="color: #666; margin: 10px 0 0 0;">ניחושי משחקים</p>
    </div>
    
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="margin: 0 0 10px 0; font-size: 24px;">שלום ${userName}! 👋</h2>
      <p style="margin: 0; font-size: 16px;">משחק מתחיל בעוד שעתיים!</p>
    </div>

    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-right: 4px solid #1a56db;">
      <h3 style="margin: 0 0 15px 0; color: #1a56db; font-size: 20px;">פרטי המשחק:</h3>
      <div style="text-align: center;">
        <p style="font-size: 24px; font-weight: bold; margin: 10px 0; color: #333;">
          ${matchDetails.homeTeam} 🆚 ${matchDetails.awayTeam}
        </p>
        <p style="font-size: 18px; color: #666; margin: 10px 0;">
          📅 ${formattedTime}
        </p>
      </div>
    </div>

    <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-right: 4px solid #ffc107;">
      <p style="margin: 0; color: #856404;">
        ⏰ <strong>זמן אוזל!</strong> יש לך עוד שעתיים לבצע את הניחוש שלך.
      </p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${appUrl}/#matches" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        🎯 נחש עכשיו
      </a>
    </div>

    <div style="border-top: 2px solid #e9ecef; padding-top: 20px; margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
      <p style="margin: 5px 0;">זכור: ניחושים מדויקים מזכים בנקודות נוספות! 🏆</p>
      <p style="margin: 5px 0;">בהצלחה! 🍀</p>
    </div>

    <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #999; font-size: 12px;">
      <p style="margin: 5px 0;">ניחושי מונדיאל 2026</p>
      <p style="margin: 5px 0;">מקבל את המייל הזה כי נרשמת לאתר שלנו</p>
    </div>
  </div>
</body>
</html>
    `.trim()
  }

  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn('Email transporter not initialized')
      return false
    }

    try {
      await this.transporter.verify()
      this.logger.log('Email service connection verified successfully')
      return true
    } catch (error: any) {
      this.logger.error(`Email service connection test failed: ${error?.message || String(error)}`)
      return false
    }
  }
}
