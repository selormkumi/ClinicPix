import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { AuthenticationService } from "../../shared/services/authentication.service";
import { S3FileService } from "../../shared/services/s3-file.service";
import { MatSnackBar } from '@angular/material/snack-bar';
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
    private s3FileService: S3FileService,
    private snackBar: MatSnackBar
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
          dob: res.dob || "",
          dobFormatted: res.dob || "",
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

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  saveChanges() {
    const payload = { ...this.patient };

    const countryObj = Country.getAllCountries().find(
      (c) =>
        c.isoCode.toLowerCase() === this.patient.country.toLowerCase() ||
        c.name.toLowerCase() === this.patient.country.toLowerCase()
    );
    payload.country = countryObj?.isoCode || this.patient.country;
    payload.phone = this.patient.phone?.internationalNumber || "";

    this.s3FileService.updateUserProfile(this.currentUserId, payload).subscribe(
      () => {
        console.log("✅ Profile saved");
        this.snackBar.open("✅ Profile updated!", "Close", { duration: 3000 });
        this.toggleEdit();
        this.fetchProfile(); // ✅ Refresh profile with updated info
      },
      (err) => {
        console.error("❌ Failed to save profile:", err);
        this.snackBar.open("❌ Failed to update profile.", "Close", { duration: 3000 });
      }
    );
  }

  logout() {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }
}