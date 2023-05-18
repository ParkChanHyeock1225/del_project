package com.example.spring.controller;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;

import com.example.spring.service.UserService;
import com.example.spring.vo.UserVo;

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping(value = "/")
public class UserController {
	
//	@RequestMapping(value = "/", method = RequestMethod.GET)
//	public ModelAndView index(HttpServletResponse response) {
//		ModelAndView mv = new ModelAndView("index");
//		
//		return mv;
//	}
	 
    @Autowired
    UserService userService; 

    /**
     * 회원가입 폼
     * @return
     */
    @GetMapping("/signUp")
    public String signUpForm() {
        return "signup";
    }

    /**
     * 회원가입 진행
     * @param user 
     * @return
     */
    @PostMapping("/signUp")
    public String signUp(UserVo userVo) {
        userService.joinUser(userVo);
        return "redirect:/index"; //로그인 구현 예정
    }
    
    @PostMapping("/createQuery")
    public void createQueryForm(String dbType, String tableName, @RequestParam(value = "columnList") List<String> columnList, @RequestParam(value = "typeList") List<String> typeList, @RequestParam(value = "pkList") List<Boolean> pkList) {
    	String test="미래금융정보1";
    	List<String> splitString = new ArrayList<String>();
    	for(int i=1;i<=test.length();i++) { //길이
    		for(int j=0;j<test.length();j++) {
    			if(j+i>test.length()) {
    				break;
    			}
    			System.out.println(test.substring(j, j+i));
    		}
    		System.out.println("======================");
    		
    	}
    	System.out.println("길이: "+test.length());
    	System.out.println(test.substring(0, 7));
    }
}