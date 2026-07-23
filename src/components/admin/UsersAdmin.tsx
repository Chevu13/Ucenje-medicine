'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { grantEntitlement, revokeEntitlement, setUserRole } from '@/app/actions/admin';
import { Alert, Button, Card, Select } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import type { Entitlement, Product, Profile, UserRole } from '@/lib/types';

export interface UserRow extends Profile {
  entitlements: (Entitlement & { product: Pick<Product, 'title'> | null })[];
}

export function UsersAdmin({
  users,
  products,
  currentAdminId,
}: {
  users: UserRow[];
  products: Pick<Product, 'id' | 'title'>[];
  currentAdminId: string;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [grantProduct, setGrantProduct] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="space-y-3">
      {error ? <Alert tone="error">{error}</Alert> : null}
      {users.map((user) => {
        const open = expanded === user.id;
        const active = user.entitlements.filter((e) => !e.revoked_at);
        return (
          <Card key={user.id} className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-ink">{user.full_name || '—'}</p>
                <p className="truncate text-xs text-ink-muted">
                  {user.email} · registrovan {formatDate(user.created_at)}
                </p>
              </div>
              <label className="sr-only" htmlFor={`role-${user.id}`}>
                Uloga za {user.email}
              </label>
              <Select
                id={`role-${user.id}`}
                className="w-32"
                value={user.role}
                disabled={pending || user.id === currentAdminId}
                onChange={(e) => {
                  const role = e.target.value as UserRole;
                  if (window.confirm(`Promeniti ulogu korisnika ${user.email} u „${role}“?`)) {
                    startTransition(async () => {
                      const res = await setUserRole(user.id, role);
                      if (!res.ok) setError(res.error);
                      router.refresh();
                    });
                  }
                }}
              >
                <option value="user">user</option>
                <option value="mentor">mentor</option>
                <option value="admin">admin</option>
              </Select>
              <Button size="sm" variant="secondary" onClick={() => setExpanded(open ? null : user.id)}>
                Pristupi ({active.length})
              </Button>
            </div>

            {open ? (
              <div className="mt-4 space-y-3 border-t border-brand-100 pt-4">
                {active.length === 0 ? (
                  <p className="text-sm text-ink-soft">Nema aktivnih pristupa.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {active.map((e) => (
                      <li key={e.id} className="flex items-center justify-between text-sm">
                        <span className="text-ink">{e.product?.title ?? e.product_id}</span>
                        <button
                          type="button"
                          className="font-semibold text-red-600 hover:underline"
                          onClick={() => {
                            if (window.confirm('Ukinuti pristup ovom proizvodu?')) {
                              startTransition(async () => {
                                const res = await revokeEntitlement(e.id);
                                if (!res.ok) setError(res.error);
                                router.refresh();
                              });
                            }
                          }}
                        >
                          Ukini
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <label className="sr-only" htmlFor={`grant-${user.id}`}>
                    Dodeli proizvod
                  </label>
                  <Select
                    id={`grant-${user.id}`}
                    className="max-w-xs"
                    value={grantProduct}
                    onChange={(e) => setGrantProduct(e.target.value)}
                  >
                    <option value="">— izaberi proizvod —</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </Select>
                  <Button
                    size="sm"
                    disabled={pending || !grantProduct}
                    onClick={() =>
                      startTransition(async () => {
                        const res = await grantEntitlement(user.id, grantProduct);
                        if (!res.ok) setError(res.error);
                        setGrantProduct('');
                        router.refresh();
                      })
                    }
                  >
                    Dodeli pristup
                  </Button>
                </div>
              </div>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}
