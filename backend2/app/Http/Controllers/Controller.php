<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\User;

abstract class Controller
{
    /**
     * Roles de personal interno (todo lo que no sea paciente).
     *
     * @var array<int, string>
     */
    protected array $staffRoles = [
        UserRole::Admin->value,
        UserRole::Receptionist->value,
        UserRole::Doctor->value,
    ];

    /**
     * Aborta la petición si el usuario no es personal interno (staff).
     */
    protected function abortUnlessStaff(?User $user): void
    {
        abort_unless($user, 401, 'No autenticado.');
        abort_unless(
            in_array($user->role, $this->staffRoles, true),
            403,
            'Esta acción es solo para personal médico.'
        );
    }
}
