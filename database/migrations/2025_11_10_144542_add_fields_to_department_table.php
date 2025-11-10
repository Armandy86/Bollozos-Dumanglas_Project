<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddFieldsToDepartmentTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('department', function (Blueprint $table) {
            if (!Schema::hasColumn('department', 'name')) {
                $table->string('name');
            }
            if (!Schema::hasColumn('department', 'description')) {
                $table->text('description')->nullable();
            }
            if (!Schema::hasColumn('department', 'is_archived')) {
                $table->boolean('is_archived')->default(false);
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('department', function (Blueprint $table) {
            if (Schema::hasColumn('department', 'name')) {
                $table->dropColumn('name');
            }
            if (Schema::hasColumn('department', 'description')) {
                $table->dropColumn('description');
            }
            if (Schema::hasColumn('department', 'is_archived')) {
                $table->dropColumn('is_archived');
            }
        });
    }
}
