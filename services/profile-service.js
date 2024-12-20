let profileService;

class ProfileService {
  loadProfile() {
    const url = `${config.baseUrl}/profile`;

    axios
      .get(url)
      .then((response) => {
        templateBuilder.build("profile", response.data, "main", () => {
          this.initUploadWidget();
          console.log("Upload widget initialized successfully");
          const imageUrl = response.data.imageUrl; // Assuming 'imageUrl' comes from backend
          const imagePreview = document.getElementById("profileImagePreview");
          const profileImageInput = document.getElementById("profileImage");

          if (imageUrl && imagePreview) {
            imagePreview.src = imageUrl;
            imagePreview.style.display = "block"; // Show the image
            profileImageInput.value = imageUrl; // Keep the input updated
          }

          console.log("Profile loaded successfully");
        });
      })
      .catch((error) => {
        const data = {
          error: "Load profile failed.",
        };

        templateBuilder.append("error", data, "errors");
      });
  }
  initUploadWidget() {
    const uploadButton = document.getElementById("upload-widget");
    const editButton = document.getElementById("edit-widget");
    const saveButton = document.getElementById("save-button");
    const imagePreview = document.getElementById("profileImagePreview");

    // Function to enable form editing
    const enableEditMode = () => {
      // Show upload and save buttons, hide the edit button
      uploadButton.style.display = "block";
      saveButton.style.display = "block";
      editButton.style.display = "none";

      // Enable form inputs
      document.querySelectorAll("#content .form-control").forEach((input) => {
        input.removeAttribute("readonly");
      });
    };

    // Event listener for Edit Button
    if (editButton) {
      editButton.addEventListener("click", enableEditMode);
    }

    // Event listener for Upload Button
    if (uploadButton) {
      uploadButton.addEventListener("click", () => {
        const myWidget = cloudinary.createUploadWidget(
          {
            cloudName: "dmrxsopf0",
            uploadPreset: "profile_preset",
            cropping: false,
            multiple: false,
          },
          (error, result) => {
            if (!error && result && result.event === "success") {
              console.log("Uploaded Image URL:", result.info.secure_url);

              // Update the hidden input with the uploaded image URL
              document.getElementById("profileImage").value =
                result.info.secure_url;

              // Update the image preview
              if (imagePreview) {
                imagePreview.src = result.info.secure_url;
                imagePreview.style.display = "block";
              }
            } else if (error) {
              console.error("Image upload error:", error);
              const errorMessage = { error: "Image upload failed." };
              templateBuilder.append("error", errorMessage, "errors");
            }
          }
        );

        myWidget.open(); // Open Cloudinary widget
      });
    }
  }

  updateProfile(profile) {
    const url = `${config.baseUrl}/profile`;

    axios
      .put(url, profile)
      .then(() => {
        const data = {
          message: "The profile has been updated.",
        };

        templateBuilder.append("message", data, "errors");
        this.loadProfile();
      })
      .catch((error) => {
        const data = {
          error: "Save profile failed.",
        };

        templateBuilder.append("error", data, "errors");
      });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log(typeof cloudinary);
  profileService = new ProfileService();
  profileService.loadProfile();
});
