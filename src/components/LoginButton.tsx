import LoginModal from './LoginModal';

export default function LoginButton() {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-base">Want to post a comment?</h3>
      <LoginModal variant="comment" />
    </div>
  );
}
