import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { User } from './auth.entity';
import { AuthService } from './auth.service';

@Resolver(() => User)
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Query(() => User, { nullable: true })
  async user(@Args('id', { type: () => Int }) id: number) {
    return this.authService.findById(id);
  }

  @Query(() => [User])
  async users() {
    return this.authService.findAll();
  }
}