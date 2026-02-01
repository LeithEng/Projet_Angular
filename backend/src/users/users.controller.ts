import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ToggleFavoriteDto } from './dto/favorite.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @Put('profile')
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const user = await this.usersService.updateProfile(
      req.user.id,
      updateProfileDto,
    );
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @Put('password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePassword(
    @Request() req,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    await this.usersService.updatePassword(
      req.user.id,
      updatePasswordDto.currentPassword,
      updatePasswordDto.newPassword,
    );
  }

  @Post('favorites/toggle')
  async toggleFavorite(
    @Request() req,
    @Body() toggleFavoriteDto: ToggleFavoriteDto,
  ) {
    return this.usersService.toggleFavorite(
      req.user.id,
      toggleFavoriteDto.contentId,
      toggleFavoriteDto.contentType,
    );
  }

  @Get('favorites')
  async getFavorites(@Request() req) {
    return this.usersService.getFavorites(req.user.id);
  }

  @Get('favorites/:contentType/:contentId')
  async isFavorite(
    @Request() req,
    @Body('contentId') contentId: number,
    @Body('contentType') contentType: 'movie' | 'tv',
  ) {
    const isFavorite = await this.usersService.isFavorite(
      req.user.id,
      contentId,
      contentType,
    );
    return { isFavorite };
  }
}
