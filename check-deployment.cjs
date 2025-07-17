const { execSync } = require('child_process');

async function checkDeployment() {
  try {
    const result = execSync('npx vercel ls', { encoding: 'utf8' });
    const lines = result.split('\n').filter(line => line.includes('https://luma-trip-'));
    
    if (lines.length > 0) {
      const latestDeployment = lines[0];
      console.log('Latest deployment:', latestDeployment);
      
      if (latestDeployment.includes('● Ready')) {
        console.log('✅ Deployment is ready!');
        return true;
      } else if (latestDeployment.includes('● Building')) {
        console.log('🔄 Deployment is still building...');
        return false;
      } else if (latestDeployment.includes('● Error')) {
        console.log('❌ Deployment failed!');
        return false;
      }
    }
  } catch (error) {
    console.error('Error checking deployment:', error.message);
  }
  
  return false;
}

checkDeployment();