package com.univoyage.profileedit;

@RestController
@RequestMapping("/profile")
public class ProfileEditController {

    @PostMapping("/update")
    public ResponseEntity<ApiResponse<String>> updateProfile(@RequestBody ProfileUpdateRequest request) {
        // Logic to update user profile
        // For now, we will just return a success response
        // in some time in future we will implement the logic to update user profile in DB
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully"));
    }
}