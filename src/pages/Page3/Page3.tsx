import { Typography } from '@mui/material';

import { FullSizeCentered } from '@/components/styled';

function Page3() {
  return (
    <>
      <meta name="title" content="Page 3" />
      <FullSizeCentered>
        <Typography variant="h3">Protected content</Typography>
      </FullSizeCentered>
    </>
  );
}

export default Page3;
