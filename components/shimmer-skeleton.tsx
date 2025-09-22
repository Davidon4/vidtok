import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import { View } from 'react-native';


 export function ShimmerSkeleton() {
  return (
    <View className="flex-1 bg-black justify-center items-center">
      <View className="w-full h-full bg-gray-800">
        <View className="absolute bottom-4 left-4 right-4">
          <ShimmerPlaceholder
            style={{ height: 16, borderRadius: 4, marginBottom: 8, width: '75%' }}
            shimmerColors={['#374151', '#4b5563', '#374151']}
          />
          <ShimmerPlaceholder
            style={{ height: 12, borderRadius: 4, width: '50%' }}
            shimmerColors={['#4b5563', '#6b7280', '#4b5563']}
          />
        </View>
      </View>
    </View>
  );
}