// components/common/Loader.tsx
interface LoaderProps {
    className?: string;
}

const Loader = ({ className = "" }: LoaderProps) => (
    <div className={`animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 ${className}`} />
);

export default Loader;