package ru.kata.spring.boot_security.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ModelAttribute;
import ru.kata.spring.boot_security.demo.entitys.Role;
import ru.kata.spring.boot_security.demo.entitys.User;
import ru.kata.spring.boot_security.demo.service.RoleService;
import ru.kata.spring.boot_security.demo.service.UserService;

import java.util.List;



@Controller
@RequestMapping("/admin")
public class AdminController {

    private final UserService userService;
    private final RoleService roleService;

    public AdminController(UserService userService, RoleService roleService) {
        this.userService = userService;
        this.roleService = roleService;
    }

    @GetMapping("/user-list")
    public String printUsers(Model model) {
        List<User> users = userService.findAll();
        model.addAttribute("users", users);
        return "admin";
    }

    @GetMapping("/addUser")
    public String addUserPage(Model model) {
        List<Role> roles = roleService.findAllRoles();
        roles.forEach(role -> System.out.println("Role: " + role.getRoleName()));
        model.addAttribute("user", new User());
        model.addAttribute("roles", roles);
        return "add-user";
    }

    @PostMapping("/addUser")
    public String addUser(@ModelAttribute User user) {
        userService.save(user);
        return "redirect:/admin/user-list";
    }

    @GetMapping("/edit/{id}")
    public String editUser(Model model, @PathVariable("id") Long id) {
        User user = userService.findById(id);
        model.addAttribute("user", user);
        model.addAttribute("roles", roleService.findAllRoles());
        return "admin-edit-user";
    }

    @PostMapping("/update/{id}")
    public String updateUser(@PathVariable Long id, @ModelAttribute("user") User user) {
        userService.update(id, user);
        return "redirect:/admin/user-list";
    }

    @PostMapping("/delete/{id}")
    public String deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return "redirect:/admin/user-list";
    }
}