import { TicketVerificationAPI } from '../TicketVerificationAPI';

interface TicketVerificationPageProps {
  onBack: () => void;
}

export function TicketVerificationPage({ onBack }: TicketVerificationPageProps) {
  return <TicketVerificationAPI onClose={onBack} />;
}