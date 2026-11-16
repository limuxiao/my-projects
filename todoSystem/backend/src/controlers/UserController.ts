import { Controller, Get, Post, Body, Param, Query, UseGuards, Put } from '@nestjs/common';

interface User {
  id: string;
}

@Controller('user')
export class UserController {
  @Get(':id')
  getUser(@Param('id') id: string) {
    return `User ${id}`;
  }

  @Put(':id')
  updateUser(@Body() user: User) {
    return `User ${user.id} updated`;
  }
}