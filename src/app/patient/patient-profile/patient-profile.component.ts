import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { AuthenticationService } from "../../shared/services/authentication.service";
import { S3FileService } from "../../shared/services/s3-file.service";
import { Country, State, City } from "country-state-city";
import {
  NgxIntlTelInputModule,
  SearchCountryField,
  CountryISO,
  PhoneNumberFormat,
} from "ngx-intl-tel-input";

@Component({
  selector: "app-patient-profile",
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule, NgxIntlTelInputModule],
  templateUrl: "./patient-profile.component.html",
  styleUrls: ["./patient-profile.component.scss"],
})
export class PatientProfileComponent implements OnInit {
  defaultProfileImage = "https://via.placeholder.com/150";

  countries: any[] = [];
  states: any[] = [];
  cities: any[] = [];

  patient: any = {
    email: "",
    name: "",
    dob: "",
    dobFormatted: "",
    state: "",
    country: "",
    age: 0,
    weight: 0,
    height: "",
    address: "",
    phone: null,
    profilePicture: this.defaultProfileImage,
  };

  isEditing = false;
  currentUserId = 0;

  // Phone config
  searchCountryField = SearchCountryField;
  countryISO = CountryISO;
  phoneNumberFormat = PhoneNumberFormat;
  searchFields = [SearchCountryField.Iso2, SearchCountryField.Name];
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates];
  selectedCountryISO: CountryISO = CountryISO.UnitedStates;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private s3FileService: S3FileService
  ) {}

  ngOnInit() {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    this.currentUserId = currentUser.userId;

    if (this.currentUserId) {
      this.getCountries();
      this.fetchProfile();
    }
  }

  fetchProfile(): void {
    this.s3FileService.getUserById(this.currentUserId).subscribe(
      (res) => {
        const countryCode = res.country || "";
        const date = res.dob ? new Date(res.dob) : null;

        const formattedPhone = res.phone
          ? {
              number: res.phone,
              internationalNumber: res.phone,
              nationalNumber: res.phone,
              e164Number: res.phone,
              countryCode: "",
              dialCode: "",
            }
          : null;

        this.patient = {
          ...this.patient,
          ...res,
          country: res.country,
          dob: date ? date.toISOString().split("T")[0] : "",
          dobFormatted: date
            ? date.toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              }).replace(",", "")
            : "",
          profilePicture: res.profile_picture || this.defaultProfileImage,
          phone: formattedPhone,
        };

        if (countryCode) {
          this.getStates(countryCode);
          this.selectedCountryISO = countryCode as CountryISO;
        }
      },
      (err) => {
        console.error("❌ Failed to fetch profile", err);
      }
    );
  }

  getCountries() {
    this.countries = Country.getAllCountries();
  }

  getCountryName(code: string): string {
    return Country.getCountryByCode(code)?.name || code;
  }

  getStates(countryCode: string) {
    this.states = State.getStatesOfCountry(countryCode);
    this.cities = [];
    this.selectedCountryISO = countryCode as CountryISO;
  }

  getCities(stateCode: string): void {
    const selectedCountryCode = this.patient.country;
    this.cities = City.getCitiesOfState(selectedCountryCode, stateCode);
  }

  handleFileInput(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const fileName = `profile-picture/${this.currentUserId}_${Date.now()}_${file.name}`;
    const fileType = file.type;

    this.s3FileService.getUploadUrl(fileName, fileType, this.currentUserId).subscribe(
      (res) => {
        fetch(res.uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": fileType },
        })
          .then(() => {
            const fileUrl = res.uploadUrl.split("?")[0];
            this.patient.profilePicture = fileUrl;
            this.saveProfilePictureUrl(fileUrl);
            console.log("✅ Profile picture uploaded:", fileUrl);
          })
          .catch((err) => {
            console.error("❌ Upload failed:", err);
          });
      },
      (err) => {
        console.error("❌ Failed to get pre-signed URL:", err);
      }
    );
  }

  saveProfilePictureUrl(fileUrl: string) {
    const payload = { profile_picture: fileUrl };

    this.s3FileService.updateUserProfile(this.currentUserId, payload).subscribe(
      () => {
        console.log("✅ Profile picture URL saved to backend");
      },
      (err) => {
        console.error("❌ Failed to save profile picture URL:", err);
      }
    );
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  saveChanges() {
    const payload = { ...this.patient };

    const countryObj = Country.getAllCountries().find(
      (c) => c.isoCode.toLowerCase() === this.patient.country.toLowerCase() ||
            c.name.toLowerCase() === this.patient.country.toLowerCase()
    );
    payload.country = countryObj?.isoCode || this.patient.country;

    payload.phone = this.patient.phone?.internationalNumber || "";

    payload.profile_picture = this.patient.profilePicture;

    this.s3FileService.updateUserProfile(this.currentUserId, payload).subscribe(
      () => {
        console.log("✅ Profile saved");
        alert("Profile updated!");
        this.toggleEdit();
      },
      (err) => {
        console.error("❌ Failed to save profile:", err);
        alert("Failed to update profile.");
      }
    );
  }

  logout() {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }
}