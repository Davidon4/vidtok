import { cn } from '@/lib/utils';
import { Platform, TextInput, type TextInputProps, View, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react-native';


function Input({
  className,
  placeholderClassName,
  ...props
}: TextInputProps & React.RefAttributes<TextInput>) {
  return (
    <TextInput
      className={cn(
        'light:bg-input/30 border border-input bg-foreground text-black flex h-10 w-full min-w-0 flex-row items-center rounded-md px-3 py-1 text-base leading-5 shadow-sm shadow-black/5 sm:h-9',
        props.editable === false &&
          cn(
            'opacity-50',
            Platform.select({ web: 'disabled:pointer-events-none disabled:cursor-not-allowed' })
          ),
        Platform.select({
          web: cn(
            'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground outline-none transition-[color,box-shadow] md:text-sm',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
          ),
          native: 'placeholder:text-muted-foreground/50',
        }),
        className
      )}
      {...props}
    />
  );
}

function PasswordInput({
  className,
  placeholderClassName,
  ...props
}: TextInputProps & React.RefAttributes<TextInput>) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="relative">
      <TextInput
        className={cn(
          'light:bg-input/30 border border-input bg-foreground text-black flex h-10 w-full min-w-0 flex-row items-center rounded-md px-3 py-1 pr-10 text-base leading-5 shadow-sm shadow-black/5 sm:h-9',
          props.editable === false &&
            cn(
              'opacity-50',
              Platform.select({ web: 'disabled:pointer-events-none disabled:cursor-not-allowed' })
            ),
          Platform.select({
            web: cn(
              'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground outline-none transition-[color,box-shadow] md:text-sm',
              'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
              'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
            ),
            native: 'placeholder:text-muted-foreground/50',
          }),
          className
        )}
        secureTextEntry={!showPassword}
        {...props}
      />
      <TouchableOpacity
        onPress={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2"
      >
        {showPassword ? <EyeOff size={20} color="#666" /> : <Eye size={20} color="#666" />}
      </TouchableOpacity>
    </View>
  );
}

export { Input, PasswordInput };