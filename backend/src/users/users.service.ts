import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userData: {
    email: string;
    username: string;
    password: string;
  }): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: [{ email: userData.email }, { username: userData.username }],
    });

    if (existingUser) {
      if (existingUser.email === userData.email) {
        throw new ConflictException('Email already exists');
      }
      throw new ConflictException('Username already exists');
    }

    const user = this.usersRepository.create(userData);
    return await this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { id } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { username } });
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find({
      select: ['id', 'email', 'username', 'isActive', 'createdAt', 'updatedAt'],
    });
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    delete updateData.password;
    delete updateData.id;

    await this.usersRepository.update(id, updateData);
    const updatedUser = await this.findById(id);
    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async updateProfile(
    id: string,
    updateData: { username?: string; profilePicture?: string },
  ): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateData.username && updateData.username !== user.username) {
      const existingUser = await this.findByUsername(updateData.username);
      if (existingUser) {
        throw new ConflictException('Username already exists');
      }
    }

    // Update fields
    if (updateData.username) user.username = updateData.username;
    if (updateData.profilePicture !== undefined)
      user.profilePicture = updateData.profilePicture;

    const updatedUser = await this.usersRepository.save(user);
    return updatedUser;
  }

  async updatePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await this.usersRepository.save(user);
  }

  async toggleFavorite(
    userId: string,
    contentId: number,
    contentType: 'movie' | 'tv',
  ): Promise<{ isFavorite: boolean }> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const favoriteField =
      contentType === 'movie' ? 'favoriteMovies' : 'favoriteTvShows';
    const currentFavorites = user[favoriteField] || [];

    let updatedFavorites: number[];
    const index = currentFavorites.indexOf(contentId);
    const isFavorite = index === -1;

    if (isFavorite) {
      updatedFavorites = [...currentFavorites, contentId];
    } else {
      updatedFavorites = currentFavorites.filter((id) => id !== contentId);
    }

    user[favoriteField] = updatedFavorites;
    await this.usersRepository.save(user);

    return { isFavorite };
  }

  async getFavorites(
    userId: string,
  ): Promise<{ movies: number[]; tvShows: number[] }> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      movies: user.favoriteMovies || [],
      tvShows: user.favoriteTvShows || [],
    };
  }

  async isFavorite(
    userId: string,
    contentId: number,
    contentType: 'movie' | 'tv',
  ): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user) {
      return false;
    }

    const favoriteField =
      contentType === 'movie' ? 'favoriteMovies' : 'favoriteTvShows';
    const favorites = user[favoriteField] || [];
    return favorites.includes(contentId);
  }
}
