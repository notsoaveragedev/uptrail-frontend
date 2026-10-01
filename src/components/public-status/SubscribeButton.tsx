import { Button, Modal, Popover } from "antd";
import { useState } from "react";
import { LuBell } from "react-icons/lu";
import { SubscribeForm } from "./SubscribeForm";

type SubscribeButtonProps = {
  title: string;
  isMobile: boolean;
  onSubscribe: (email: string) => Promise<void>;
};

const TITLE = "Subscribe to updates";

export function SubscribeButton({ title, isMobile, onSubscribe }: SubscribeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const form = <SubscribeForm title={title} onSubscribe={onSubscribe} />;

  if (isMobile) {
    return (
      <>
        <Button type="primary" icon={<LuBell />} aria-label={TITLE} onClick={() => setIsOpen(true)} />
        <Modal
          open={isOpen}
          title={TITLE}
          footer={null}
          width="22rem"
          destroyOnHidden
          onCancel={() => setIsOpen(false)}
        >
          {form}
        </Modal>
      </>
    );
  }

  return (
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger="click"
      placement="bottomRight"
      destroyOnHidden
      title={<span className="text-md font-semibold">{TITLE}</span>}
      content={<div className="w-72 pt-1">{form}</div>}
    >
      <Button type="primary" icon={<LuBell />}>
        {TITLE}
      </Button>
    </Popover>
  );
}
