import { type SetStateAction, type Dispatch } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Controller, useForm, useFormContext } from 'react-hook-form';
import { kittenSchema, type litterSchema } from '~/lib/validators/litter';
import { type z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';

interface AddKittenModalProps {
  isKittenDialogOpen: boolean;
  setIsKittenDialogOpen: Dispatch<SetStateAction<boolean>>;
}

export default function AddKittenModal({
  isKittenDialogOpen,
  setIsKittenDialogOpen,
}: AddKittenModalProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<z.infer<typeof kittenSchema>>({
    resolver: zodResolver(kittenSchema),
    defaultValues: {
      name: '',
      gender: 'female',
      info: '',
      stamnavn: '',
      orderStatus: 'AVAILABLE',
    },
  });
  const litterForm = useFormContext<z.infer<typeof litterSchema>>();

  function onSubmitKitten(values: z.infer<typeof kittenSchema>) {
    if (
      litterForm
        .getValues('kittens')
        .find(
          (kitten) => kitten.name.toLowerCase() === values.name.toLowerCase()
        )
    ) {
      setError(
        'name',
        {
          type: 'custom',
          message: 'Kitten with this name already exists',
        },
        { shouldFocus: true }
      );
    } else {
      litterForm.setValue(
        'kittens',
        [...litterForm.getValues('kittens'), values],
        { shouldValidate: true, shouldDirty: true }
      );
      closeModal();
    }
  }

  function closeModal() {
    setIsKittenDialogOpen(!isKittenDialogOpen);
    reset();
  }

  return (
    <Dialog open={isKittenDialogOpen} onOpenChange={closeModal}>
      <DialogTrigger asChild>
        <Button type="button" className="self-start" variant={'secondary'}>
          <Plus className="mr-1" size={16} />
          Add kitten
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Kitten</DialogTitle>
          <DialogDescription>
            Create a new kitten for this litter.
          </DialogDescription>
        </DialogHeader>
        <div className="grid w-full max-w-sm items-center gap-3">
          <Label htmlFor="name">Name</Label>
          <div className="flex flex-col gap-1">
            <Input
              type="name"
              id="name"
              placeholder="Name"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <Label htmlFor="stamnavn">Fargekode</Label>
          <div className="flex flex-col gap-1">
            <Input
              type="stamnavn"
              id="stamnavn"
              placeholder="Fargekode"
              {...register('stamnavn', { required: 'Fargekode is required' })}
            />
            {errors.stamnavn && (
              <p className="text-sm text-red-500">{errors.stamnavn.message}</p>
            )}
          </div>
          <Label htmlFor="info">Info (can be empty)</Label>
          <div className="flex flex-col gap-1">
            <Input
              type="info"
              id="info"
              placeholder="Info"
              {...register('info')}
            />
            {errors.info && (
              <p className="text-sm text-red-500">{errors.info.message}</p>
            )}
          </div>
          <div className="flex gap-12">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Gender</Label>
              <Controller
                control={control}
                name="gender"
                defaultValue="female"
                render={({ field: { onChange, value } }) => (
                  <RadioGroup value={value} onValueChange={onChange}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female">Female</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="man" id="man" />
                      <Label htmlFor="man">Male</Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="orderStatus">Order status</Label>
              <Controller
                control={control}
                name="orderStatus"
                defaultValue="AVAILABLE"
                render={({ field: { onChange, value } }) => (
                  <RadioGroup value={value} onValueChange={onChange}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="AVAILABLE" id="available" />
                      <Label htmlFor="available">Available</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="BOOKED" id="booked" />
                      <Label htmlFor="booked">Booked</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="SOLD" id="sold" />
                      <Label htmlFor="sold">Sold</Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" onClick={handleSubmit(onSubmitKitten)}>
            Add new kitten
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
