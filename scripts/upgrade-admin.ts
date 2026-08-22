import { db } from '../src/lib/db';

async function main() {
  const userId = 'cmsouwgn70000d8dlihcu0qga';
  try {
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { role: 'ADMIN' },
    });
    console.log(`Successfully upgraded user ${updatedUser.name || updatedUser.email || updatedUser.id} to ADMIN`);
  } catch (error) {
    console.error('Error upgrading user to ADMIN:', error);
  }
}

main().catch(console.error);
