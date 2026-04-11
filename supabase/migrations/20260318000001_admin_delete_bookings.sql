-- Allow admins to delete bookings
CREATE POLICY "admin_delete_bookings"
  ON bookings FOR DELETE TO authenticated
  USING (public.is_admin());
