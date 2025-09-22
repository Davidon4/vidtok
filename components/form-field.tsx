import { Controller } from "react-hook-form";
import { View } from "react-native";

import { Input, PasswordInput } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import {Label} from "@/components/ui/label";
import { InputField } from "@/types/auth";

export function FormField(InputField: InputField) {
  return (
    <View className="mb-4">
        <Label nativeID={InputField.name} className="text-black py-2">{InputField.label}</Label>
      <Controller
        control={InputField.control}
        name={InputField.name}
        render={({ field: { onChange, onBlur, value } }) => 
          InputField.secureTextEntry ? (
            <PasswordInput
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder={InputField.placeholder}
            />
          ) : (
            <Input
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder={InputField.placeholder}
            />
          )
        }
      />
      {InputField.error && <Text className="text-red-500">{InputField.error.message}</Text>}
    </View>
  );
}
