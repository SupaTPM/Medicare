<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('about-medflow', function () {
    $this->info('MedFlow backend is available.');
})->purpose('Show MedFlow backend status');
