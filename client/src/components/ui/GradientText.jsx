import { cn } from '@/utils/cn';

export default function GradientText({ children, as: Tag = 'span', className, ...props }) {
  return (
    <Tag className={cn('gradient-text', className)} {...props}>
      {children}
    </Tag>
  );
}
