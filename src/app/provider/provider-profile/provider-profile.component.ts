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
  selector: "app-provider-profile",
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule, NgxIntlTelInputModule],
  templateUrl: "./provider-profile.component.html",
  styleUrls: ["./provider-profile.component.scss"],
})
export class ProfileComponent implements OnInit {
  countries: any[] = [];
  states: any[] = [];
  cities: any[] = [];

  provider: any = {
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
  };

  isEditing = false;
  currentUserId = 0;

  // Phone config for ngx-intl-tel-input
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

        this.provider = {
          ...this.provider,
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
    const selectedCountryCode = this.provider.country;
    this.cities = City.getCitiesOfState(selectedCountryCode, stateCode);
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  saveChanges() {
    const payload = { ...this.provider };

    const countryObj = Country.getAllCountries().find(
      (c) =>
        c.isoCode.toLowerCase() === this.provider.country.toLowerCase() ||
        c.name.toLowerCase() === this.provider.country.toLowerCase()
    );
    payload.country = countryObj?.isoCode || this.provider.country;

    payload.phone = this.provider.phone?.internationalNumber || "";

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