import { User, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AutoComplete, type Option } from "@/components/ui/autocomplete";
import { COUNTRIES } from "@/lib/constants";

interface SignUpBasicFieldsProps {
  name: string;
  setName: (value: string) => void;
  surname: string;
  setSurname: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  country: Option | undefined;
  setCountry: (value: Option | undefined) => void;
}

export const SignUpBasicFields = ({
  name,
  setName,
  surname,
  setSurname,
  email,
  setEmail,
  country,
  setCountry,
}: SignUpBasicFieldsProps) => {
  return (
    <>
      {/* First Name and Surname in a row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name Input */}
        <div className="space-y-2">
          <label htmlFor="signup-firstname" className="text-sm font-medium text-foreground">
            Name <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="signup-firstname"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        {/* Surname Input */}
        <div className="space-y-2">
          <label htmlFor="signup-surname" className="text-sm font-medium text-foreground">
            Surname
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="signup-surname"
              type="text"
              placeholder="Enter your surname"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Email and Country in a row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email Input */}
        <div className="space-y-2">
          <label htmlFor="signup-email" className="text-sm font-medium text-foreground">
            Email <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="signup-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        {/* Country */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Country of Origin <span className="text-destructive">*</span>
          </label>
          <AutoComplete
            options={COUNTRIES}
            placeholder="Select your country..."
            emptyMessage="No countries found"
            value={country}
            onValueChange={setCountry}
          />
        </div>
      </div>
    </>
  );
};

