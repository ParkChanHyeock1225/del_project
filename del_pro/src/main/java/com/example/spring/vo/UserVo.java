package com.example.spring.vo;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class UserVo {
    private int userNo;
    private String userId;
    private String userPw;
    private String userName;
    private String userAuth;
    private String appendDate;
    private String updateDate;
}
