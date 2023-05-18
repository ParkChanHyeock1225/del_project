package com.example.spring.mapper;

import org.apache.ibatis.annotations.Mapper;

import com.example.spring.vo.UserVo;

@Mapper
public interface UserMapper {
    void saveUser(UserVo userVo);
}