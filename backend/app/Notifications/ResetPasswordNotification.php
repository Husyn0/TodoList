<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword as BaseResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends BaseResetPassword
{
    public function toMail($notifiable): MailMessage
    {
        $frontend = rtrim(config('services.frontend.url'), '/')
                  . config('services.frontend.reset_path');

        $url = $frontend
             . '?token=' . $this->token
             . '&email=' . urlencode($notifiable->getEmailForPasswordReset());

        return (new MailMessage)
            ->subject('Reset your password')
            ->greeting('Hi ' . $notifiable->name . ',')
            ->line('You requested a password reset.')
            ->action('Reset Password', $url)
            ->line('This link expires in 60 minutes.')
            ->line('If you did not request this, no action is required.');
    }
}