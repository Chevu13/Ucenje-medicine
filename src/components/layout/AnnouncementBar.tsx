import Link from 'next/link';
import { getActiveAnnouncement } from '@/lib/queries';

export async function AnnouncementBar() {
  const announcement = await getActiveAnnouncement();
  if (!announcement) return null;

  const content = (
    <p className="container-page py-2.5 text-center text-sm font-semibold text-white">
      {announcement.message}
      {announcement.href ? <span className="ml-2 underline underline-offset-2">Saznaj više →</span> : null}
    </p>
  );

  return (
    <div className="bg-brand-700">
      {announcement.href ? (
        <Link href={announcement.href} className="block hover:bg-brand-800">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}
