import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Check if RESEND_API_KEY is configured
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    // Initialize Resend client after verifying API key exists
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send email to your notification address
    // Replace with your actual email address
    const notificationEmail = process.env.WAITLIST_NOTIFICATION_EMAIL || "your-email@example.com";

    await resend.emails.send({
      from: "Treki Waitlist <onboarding@resend.dev>", // Update with your verified domain
      to: notificationEmail,
      subject: `New Waitlist Signup: ${email}`,
      html: `
        <h2>New Waitlist Signup</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      `,
    });

    // Optional: Send confirmation email to user
    await resend.emails.send({
      from: "Treki Waitlist <onboarding@resend.dev>", // Update with your verified domain
      to: email,
      subject: "You're on the Treki waitlist!",
      html: `
        <h2>Thanks for joining the Treki waitlist!</h2>
        <p>We'll notify you when Treki is ready. Get ready to plan your perfect trip!</p>
        <p>Best,<br>The Treki Team</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Waitlist signup error:", error);
    
    // Provide more detailed error message
    const errorMessage = error?.message || "Failed to join waitlist. Please try again.";
    const statusCode = error?.statusCode || 500;
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

