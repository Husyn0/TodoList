<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as BaseVerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\URL;

class VerifyEmailNotification extends BaseVerifyEmail
{
    protected function buildVerifyUrl($notifiable): string
    {
        return URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(60),
            [
                'id'   => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );
    }

    public function toMail($notifiable): MailMessage
    {
        $url = $this->buildVerifyUrl($notifiable);
        

        return (new MailMessage)
            ->subject('Verify your email address')
            ->greeting('Hi ' . $notifiable->name . ',')
            ->line('Please confirm your email address to activate your account.')
            ->action('Verify Email', $url)
            ->line('This link expires in 60 minutes.')
            ->line('If you did not create an account, no action is required.');
    }
}