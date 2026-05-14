import prisma from '../config/prisma.js';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken  } from '../lib/jwt.js';

export const registerUserService = async (data:any) => {
  const { name, email, password, number, profileImage } = data;

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
     throw new Error("USER_ALREADY_EXISTS");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      number,
      profileImage
    }
  })
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      number: user.number,
      profileImage: user.profileImage
    },
  };
};

export const loginUser = async (data: { email: string; password: string }) => {
  const { email, password } = data;
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (!existingUser) {
     throw new Error("USER_NOT_FOUND");
  }

  const isPasswordValid = await bcrypt.compare(password, existingUser.password)

  if (!isPasswordValid) {
     throw new Error("INVALID_PASSWORD");
  }
  const accessToken = generateAccessToken(existingUser);
  const refreshToken = generateRefreshToken(existingUser);

  if(!accessToken && !refreshToken){
     throw new Error("FAILED_TO_GENERATE_TOKEN");
  }

  return {
    accessToken,
    refreshToken,
    user: {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      number: existingUser.number,
      profileImage: existingUser.profileImage
    }
  };
};

export const getProfileService = async (userId: string)=>{
    const findUser= await prisma.user.findUnique({
      where:{ id: userId }
    })
    if(!findUser){
      return null; 
    }
    return {
      message:"User profile fetched successfully",
      user:{
        id: findUser.id,
        name:findUser.name,
        email:findUser.email,
        number:findUser.number,
        profileImage:findUser.profileImage
      }
    } 
  }

export const getAllUsersService = async (currentUserId: string) => {
  const users = await prisma.user.findMany({
    where: {
      id: { not: currentUserId }
    },
    select: {
      id: true,
      name: true,
      email: true,
      number: true,
      profileImage: true,
      createdAt: true
    }
  });
  return users;
};