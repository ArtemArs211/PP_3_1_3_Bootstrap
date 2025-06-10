package ru.kata.spring.boot_security.demo.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import ru.kata.spring.boot_security.demo.entitys.User;
import ru.kata.spring.boot_security.demo.service.UserService;



@Controller
@RequestMapping("/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/user-page")
    public String userPage(Model model, @AuthenticationPrincipal UserDetails loggedUser) {
        User user = userService.findByUsername(loggedUser.getUsername());
        model.addAttribute("user", user);
        return "user-page";
    }

    @GetMapping("/edit")
    public String editUserPage(Model model, @AuthenticationPrincipal User loggedUser) {
        User user = userService.findByUsername(loggedUser.getUsername());
        model.addAttribute("user", user);
        return "edit-user";
    }

    @PatchMapping("/edit")
    public String patchUser(@ModelAttribute("user") User user) {
        try {
            userService.update(user.getId(), user);
        } catch (Exception e) {
            throw new RuntimeException("Error updating user", e);
        }

        return "redirect:/user/user-page";
    }

    @PostMapping("/update")
    public String updateUser(@ModelAttribute("user") User user) {
        userService.update(user.getId(), user);
        return "redirect:/user";
    }
}